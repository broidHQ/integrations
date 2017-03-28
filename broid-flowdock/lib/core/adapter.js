"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schemas_1 = require("@broid/schemas");
const utils_1 = require("@broid/utils");
const Promise = require("bluebird");
const flowdock = require("flowdock");
const uuid = require("node-uuid");
const R = require("ramda");
const Rx_1 = require("rxjs/Rx");
const Parser_1 = require("./Parser");
const makeRequest = (session, method, ...args) => new Promise((resolve, reject) => session[method](...args, (err, body) => err ? reject(err) : resolve(body)));
class Adapter {
    constructor(obj) {
        this.serviceID = obj && obj.serviceID || uuid.v4();
        this.logLevel = obj && obj.logLevel || 'info';
        this.token = obj && obj.token || null;
        this.parser = new Parser_1.Parser(this.serviceID, this.logLevel);
        this.logger = new utils_1.Logger('adapter', this.logLevel);
        this.storeUsers = new Map();
        this.storeFlows = new Map();
    }
    users() {
        return Promise.resolve(this.storeUsers.values());
    }
    channels() {
        return Promise.resolve(this.storeFlows.values());
    }
    serviceId() {
        return this.serviceID;
    }
    connect() {
        if (!this.token) {
            return Rx_1.Observable.throw(new Error('Credentials should exist.'));
        }
        this.session = new flowdock.Session(this.token);
        return Rx_1.Observable.of({ type: 'connected', serviceID: this.serviceId() });
    }
    disconnect() {
        return Promise.reject(new Error('Not supported'));
    }
    listen() {
        const getFlows = new Promise((resolve, reject) => {
            this.session.flows((err, flows) => {
                if (err) {
                    return reject(err);
                }
                return resolve(flows);
            });
        });
        return Rx_1.Observable.fromPromise(getFlows)
            .mergeMap((flows) => {
            const users = R.flatten(R.map((flow) => flow.users, flows));
            R.forEach((user) => this.storeUsers.set(user.id.toString(), user), users);
            R.forEach((flow) => this.storeFlows.set(flow.id.toString(), R.dissoc('users', flow)), flows);
            return Promise.resolve(R.map((flow) => flow.id.toString(), flows));
        })
            .mergeMap((flowIDs) => {
            const streams = R.map((flowID) => this.session.stream(flowID, { user: 1 }), flowIDs);
            const obs = R.map((stream) => Rx_1.Observable.fromEvent(stream, 'message'), streams);
            return Rx_1.Observable.merge(...obs);
        })
            .mergeMap((event) => {
            this.logger.debug('Event received', event);
            if (event.event !== 'message' && event.event !== 'message-edit') {
                return Rx_1.Observable.empty();
            }
            if (!event.flow) {
                return this.userByID(event.user)
                    .then((userFrom) => {
                    event.flow = userFrom;
                    event.user = userFrom;
                    event._isPrivate = true;
                    return event;
                });
            }
            return this.flowByID(event.flow)
                .then((flow) => {
                return this.userByID(event.user)
                    .then((user) => {
                    event.flow = flow;
                    event.user = user;
                    return event;
                });
            });
        })
            .mergeMap((normalized) => this.parser.parse(normalized))
            .mergeMap((parsed) => this.parser.validate(parsed))
            .mergeMap((validated) => {
            if (!validated) {
                return Rx_1.Observable.empty();
            }
            return Promise.resolve(validated);
        });
    }
    send(data) {
        this.logger.debug('sending', { message: data });
        return schemas_1.default(data, 'send')
            .then(() => {
            if (R.path(['object', 'type'], data) !== 'Note') {
                return Promise.reject(new Error('Only Note is supported.'));
            }
            return Promise.resolve(data)
                .then((result) => {
                const dataType = data.type;
                const flowID = R.path(['to', 'id'], result);
                const toType = R.path(['to', 'type'], result);
                const content = R.path(['object', 'content'], result);
                const contentID = R.path(['object', 'id'], result);
                const tags = R.map((tag) => tag.name, R.path(['object', 'tag'], result) || []);
                const context = R.path(['object', 'context'], result);
                if (context && context.content) {
                    return Promise.fromCallback((cb) => this.session
                        .threadMessage(flowID, context.content, content, tags, cb));
                }
                else if (toType === 'Group' && (dataType === 'Update' || dataType === 'Delete')) {
                    return this.flowByID(flowID)
                        .then((flow) => Promise.fromCallback((cb) => this.session
                        .editMessage(flow.parameterized_name, R.path(['organization', 'parameterized_name'], flow), Number(contentID), { content, tags }, cb)));
                }
                else if (toType === 'Person') {
                    return this.userByID(flowID)
                        .tap(console.log)
                        .then((user) => Promise.fromCallback((cb) => this.session
                        .privateMessage(user.id, content, tags, cb)));
                }
                return Promise.fromCallback((cb) => this.session
                    .message(flowID, content, tags, cb));
            });
        })
            .then(({ type: 'sent', serviceID: this.serviceId() }));
    }
    userByID(userID) {
        return Promise.resolve(this.storeUsers.get(userID))
            .then((user) => {
            if (!user) {
                return makeRequest(this.session, 'users', { id: userID })
                    .then((body) => {
                    this.storeUsers.set(body.id.toString(), body);
                    return body;
                });
            }
            return user;
        });
    }
    flowByID(flowID) {
        return Promise.resolve(this.storeFlows.get(flowID))
            .then((flow) => {
            if (!flow) {
                return makeRequest(this.session, '/flows/find', { id: flowID })
                    .then((body) => {
                    R.forEach((user) => this.storeUsers.set(user.id.toString(), user), body.users);
                    this.storeFlows.set(body.id.toString(), R.dissoc('users', body));
                    return body;
                });
            }
            return flow;
        });
    }
}
exports.Adapter = Adapter;

"use strict";
var schemas_1 = require("@broid/schemas");
var utils_1 = require("@broid/utils");
var Promise = require("bluebird");
var flowdock = require("flowdock");
var uuid = require("node-uuid");
var R = require("ramda");
var Rx_1 = require("rxjs/Rx");
var Parser_1 = require("./Parser");
var makeRequest = function (session, method) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    return new Promise(function (resolve, reject) {
        return session[method].apply(session, args.concat([function (err, body) {
                return err ? reject(err) : resolve(body);
            }]));
    });
};
var Adapter = (function () {
    function Adapter(obj) {
        this.serviceID = obj && obj.serviceID || uuid.v4();
        this.logLevel = obj && obj.logLevel || 'info';
        this.token = obj && obj.token || null;
        this.parser = new Parser_1.Parser(this.serviceID, this.logLevel);
        this.logger = new utils_1.Logger('adapter', this.logLevel);
        this.storeUsers = new Map();
        this.storeFlows = new Map();
    }
    Adapter.prototype.users = function () {
        return Promise.resolve(this.storeUsers);
    };
    Adapter.prototype.channels = function () {
        return Promise.resolve(this.storeFlows);
    };
    Adapter.prototype.serviceId = function () {
        return this.serviceID;
    };
    Adapter.prototype.connect = function () {
        if (!this.token) {
            return Rx_1.Observable.throw(new Error('Credentials should exist.'));
        }
        if (this.connected) {
            return Rx_1.Observable.of({ type: 'connected', serviceID: this.serviceId() });
        }
        this.connected = true;
        this.session = new flowdock.Session(this.token);
        return Rx_1.Observable.of({ type: 'connected', serviceID: this.serviceId() });
    };
    Adapter.prototype.disconnect = function () {
        this.connected = false;
        return Promise.resolve(null);
    };
    Adapter.prototype.listen = function () {
        var _this = this;
        var getFlows = new Promise(function (resolve, reject) {
            _this.session.flows(function (err, flows) {
                if (err) {
                    return reject(err);
                }
                return resolve(flows);
            });
        });
        return Rx_1.Observable.fromPromise(getFlows)
            .mergeMap(function (flows) {
            var users = R.flatten(R.map(function (flow) { return flow.users; }, flows));
            R.forEach(function (user) { return _this.storeUsers.set(user.id.toString(), user); }, users);
            R.forEach(function (flow) { return _this.storeFlows.set(flow.id.toString(), R.dissoc('users', flow)); }, flows);
            return Promise.resolve(R.map(function (flow) { return flow.id.toString(); }, flows));
        })
            .mergeMap(function (flowIDs) {
            var streams = R.map(function (flowID) {
                return _this.session.stream(flowID, { user: 1 });
            }, flowIDs);
            var obs = R.map(function (stream) {
                return Rx_1.Observable.fromEvent(stream, 'message');
            }, streams);
            return Rx_1.Observable.merge.apply(Rx_1.Observable, obs);
        })
            .mergeMap(function (event) {
            _this.logger.debug('Event received', event);
            if (event.event !== 'message' && event.event !== 'message-edit') {
                return Rx_1.Observable.empty();
            }
            if (!event.flow) {
                return _this.userByID(event.user)
                    .then(function (userFrom) {
                    event.flow = userFrom;
                    event.user = userFrom;
                    event._isPrivate = true;
                    return event;
                });
            }
            return _this.flowByID(event.flow)
                .then(function (flow) {
                return _this.userByID(event.user)
                    .then(function (user) {
                    event.flow = flow;
                    event.user = user;
                    return event;
                });
            });
        })
            .mergeMap(function (normalized) { return _this.parser.parse(normalized); })
            .mergeMap(function (parsed) { return _this.parser.validate(parsed); })
            .mergeMap(function (validated) {
            if (!validated) {
                return Rx_1.Observable.empty();
            }
            return Promise.resolve(validated);
        });
    };
    Adapter.prototype.send = function (data) {
        var _this = this;
        this.logger.debug('sending', { message: data });
        return schemas_1.default(data, 'send')
            .then(function () {
            if (R.path(['object', 'type'], data) !== 'Note') {
                return Promise.reject(new Error('Only Note is supported.'));
            }
            return Promise.resolve(data)
                .then(function (result) {
                var type = data.type;
                var flowID = R.path(['to', 'id'], result);
                var toType = R.path(['to', 'type'], result);
                var content = R.path(['object', 'content'], result);
                var contentID = R.path(['object', 'id'], result);
                var tags = R.map(function (tag) {
                    return tag.name;
                }, R.path(['object', 'tag'], result) || []);
                var context = R.path(['object', 'context'], result);
                if (context && context.content) {
                    return Promise.fromCallback(function (cb) { return _this.session
                        .threadMessage(flowID, context.content, content, tags, cb); });
                }
                else if (toType === 'Group' && (type === 'Update' || type === 'Delete')) {
                    return _this.flowByID(flowID)
                        .then(function (flow) {
                        return Promise.fromCallback(function (cb) { return _this.session
                            .editMessage(flow.parameterized_name, R.path(['organization', 'parameterized_name'], flow), Number(contentID), { content: content, tags: tags }, cb); });
                    });
                }
                else if (toType === 'Person') {
                    return _this.userByID(flowID)
                        .tap(console.log)
                        .then(function (user) {
                        return Promise.fromCallback(function (cb) { return _this.session
                            .privateMessage(user.id, content, tags, cb); });
                    });
                }
                return Promise.fromCallback(function (cb) { return _this.session
                    .message(flowID, content, tags, cb); });
            });
        })
            .then(({ type: 'sent', serviceID: this.serviceId() }));
    };
    Adapter.prototype.userByID = function (userID) {
        var _this = this;
        return Promise.resolve(this.storeUsers.get(userID))
            .then(function (user) {
            if (!user) {
                return makeRequest(_this.session, 'users', { id: userID })
                    .then(function (body) {
                    _this.storeUsers.set(body.id.toString(), body);
                    return body;
                });
            }
            return user;
        });
    };
    Adapter.prototype.flowByID = function (flowID) {
        var _this = this;
        return Promise.resolve(this.storeFlows.get(flowID))
            .then(function (flow) {
            if (!flow) {
                return makeRequest(_this.session, '/flows/find', { id: flowID })
                    .then(function (body) {
                    R.forEach(function (user) {
                        return _this.storeUsers.set(user.id.toString(), user);
                    }, body.users);
                    _this.storeFlows.set(body.id.toString(), R.dissoc('users', body));
                    return body;
                });
            }
            return flow;
        });
    };
    return Adapter;
}());
exports.Adapter = Adapter;

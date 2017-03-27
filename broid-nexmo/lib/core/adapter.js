"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schemas_1 = require("@broid/schemas");
const utils_1 = require("@broid/utils");
const Promise = require("bluebird");
const Nexmo = require("nexmo");
const uuid = require("node-uuid");
const R = require("ramda");
const Rx_1 = require("rxjs/Rx");
const Parser_1 = require("./Parser");
const WebHookServer_1 = require("./WebHookServer");
class Adapter {
    constructor(obj) {
        this.serviceID = obj && obj.serviceID || uuid.v4();
        this.logLevel = obj && obj.logLevel || 'info';
        this.token = obj && obj.token || null;
        this.tokenSecret = obj && obj.tokenSecret || null;
        this.username = obj && obj.username || null;
        const optionsHTTP = {
            host: '127.0.0.1',
            port: 8080,
        };
        this.optionsHTTP = obj && obj.http || optionsHTTP;
        this.optionsHTTP.host = this.optionsHTTP.host || optionsHTTP.host;
        this.optionsHTTP.port = this.optionsHTTP.port || optionsHTTP.port;
        this.parser = new Parser_1.Parser(this.serviceID, this.logLevel);
        this.logger = new utils_1.Logger('adapter', this.logLevel);
    }
    users() {
        return Promise.reject(new Error('Not supported'));
    }
    channels() {
        return Promise.reject(new Error('Not supported'));
    }
    serviceId() {
        return this.serviceID;
    }
    connect() {
        if (this.connected) {
            return Rx_1.Observable.of({ type: 'connected', serviceID: this.serviceId() });
        }
        this.connected = true;
        if (!this.token || this.token === '') {
            return Rx_1.Observable.throw(new Error('Token should exist.'));
        }
        if (!this.tokenSecret || this.tokenSecret === '') {
            return Rx_1.Observable.throw(new Error('TokenSecret should exist.'));
        }
        this.session = new Nexmo({
            apiKey: this.token,
            apiSecret: this.tokenSecret,
        });
        this.webhookServer = new WebHookServer_1.WebHookServer(this.optionsHTTP, this.logLevel);
        this.webhookServer.listen();
        return Rx_1.Observable.of(({ type: 'connected', serviceID: this.serviceId() }));
    }
    disconnect() {
        return Promise.reject(new Error('Not supported'));
    }
    listen() {
        if (!this.webhookServer) {
            return Rx_1.Observable.throw(new Error('No webhookServer found.'));
        }
        return Rx_1.Observable.fromEvent(this.webhookServer, 'message')
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
            if (data.object.type !== 'Note') {
                return Promise.reject(new Error('Only Note is supported.'));
            }
            return Promise.resolve(data)
                .then((result) => {
                const toNumber = R.path(['to', 'id'], result);
                const content = R.path(['object', 'content'], result);
                return Promise.fromCallback((cb) => this.session.message.sendSms(this.username, toNumber, content, {}, cb));
            })
                .then((result) => {
                const ids = R.map((message) => message['message-id'], result.messages);
                return { type: 'sent', serviceID: this.serviceId(), ids };
            });
        });
    }
}
exports.Adapter = Adapter;

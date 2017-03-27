"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schemas_1 = require("@broid/schemas");
const utils_1 = require("@broid/utils");
const Promise = require("bluebird");
const uuid = require("node-uuid");
const R = require("ramda");
const Rx_1 = require("rxjs/Rx");
const twilio = require("twilio");
const Parser_1 = require("./Parser");
const WebHookServer_1 = require("./WebHookServer");
class Adapter {
    constructor(obj) {
        this.serviceID = obj && obj.serviceID || uuid.v4();
        this.logLevel = obj && obj.logLevel || 'info';
        this.token = obj && obj.token || null;
        this.tokenSecret = obj && obj.tokenSecret || null;
        this.username = obj && obj.username || 'SMS';
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
        if (!this.token
            || !this.tokenSecret) {
            return Rx_1.Observable.throw(new Error('Credentials should exist.'));
        }
        this.session = new twilio.RestClient(this.token, this.tokenSecret);
        this.webhookServer = new WebHookServer_1.WebHookServer(this.optionsHTTP, this.logLevel);
        this.webhookServer.listen();
        return Rx_1.Observable.of({ type: 'connected', serviceID: this.serviceId() });
    }
    disconnect() {
        return Promise.reject(new Error('Not supported'));
    }
    listen() {
        if (!this.session) {
            return Rx_1.Observable.throw(new Error('No session found.'));
        }
        return Rx_1.Observable.fromEvent(this.webhookServer, 'message')
            .mergeMap((event) => this.parser.normalize(event))
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
            const toNumber = R.path(['to', 'id'], data)
                || R.path(['to', 'name'], data);
            const dataType = R.path(['object', 'type'], data);
            let content = R.path(['object', 'content'], data)
                || R.path(['object', 'name'], data);
            if (dataType === 'Image' || dataType === 'Video') {
                content = R.path(['object', 'url'], data)
                    || R.path(['object', 'content'], data)
                    || R.path(['object', 'name'], data);
            }
            if (dataType === 'Note' || dataType === 'Image' || dataType === 'Video') {
                const sms = {
                    body: content,
                    from: this.username,
                    to: toNumber,
                };
                return new Promise((resolve, reject) => {
                    return this.session.messages.create(sms, (err) => {
                        if (err) {
                            return reject(err);
                        }
                        return resolve({ type: 'sent', serviceID: this.serviceId() });
                    });
                });
            }
            return Promise.reject(new Error('Only Note, Image, and Video are supported.'));
        });
    }
}
exports.Adapter = Adapter;

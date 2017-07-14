"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schemas_1 = require("@broid/schemas");
const utils_1 = require("@broid/utils");
const Promise = require("bluebird");
const events_1 = require("events");
const express_1 = require("express");
const uuid = require("uuid");
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
        this.parser = new Parser_1.Parser(this.serviceName(), this.serviceID, this.logLevel);
        this.logger = new utils_1.Logger('adapter', this.logLevel);
        this.emitter = new events_1.EventEmitter();
        this.router = this.setupRouter();
        if (obj.http) {
            this.webhookServer = new WebHookServer_1.WebHookServer(obj.http, this.router, this.logLevel);
        }
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
    serviceName() {
        return 'twilio';
    }
    getRouter() {
        if (this.webhookServer) {
            return null;
        }
        return this.router;
    }
    connect() {
        if (this.connected) {
            return Rx_1.Observable.of({ type: 'connected', serviceID: this.serviceId() });
        }
        if (!this.token || !this.tokenSecret) {
            return Rx_1.Observable.throw(new Error('Credentials should exist.'));
        }
        this.session = new twilio.RestClient(this.token, this.tokenSecret);
        if (this.webhookServer) {
            this.webhookServer.listen();
        }
        this.connected = true;
        return Rx_1.Observable.of({ type: 'connected', serviceID: this.serviceId() });
    }
    disconnect() {
        this.connected = false;
        if (this.webhookServer) {
            return this.webhookServer.close();
        }
        return Promise.resolve(null);
    }
    listen() {
        if (!this.session) {
            return Rx_1.Observable.throw(new Error('No session found.'));
        }
        return Rx_1.Observable.fromEvent(this.emitter, 'message')
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
            const objectType = R.path(['object', 'type'], data);
            let content = R.path(['object', 'content'], data)
                || R.path(['object', 'name'], data);
            if (objectType === 'Image' || objectType === 'Video') {
                content = R.path(['object', 'url'], data)
                    || R.path(['object', 'content'], data)
                    || R.path(['object', 'name'], data);
            }
            if (objectType === 'Note' || objectType === 'Image' || objectType === 'Video') {
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
    setupRouter() {
        const router = express_1.Router();
        router.post('/', (req, res) => {
            const event = {
                request: req,
                response: res,
            };
            this.emitter.emit('message', event);
            const twiml = new twilio.TwimlResponse();
            res.type('text/xml');
            res.send(twiml.toString());
        });
        return router;
    }
}
exports.Adapter = Adapter;

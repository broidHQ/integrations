"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schemas_1 = require("@broid/schemas");
const utils_1 = require("@broid/utils");
const Promise = require("bluebird");
const Callr = require("callr");
const EventEmitter = require("events");
const express_1 = require("express");
const uuid = require("uuid");
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
        this.username = obj && obj.username || 'SMS';
        this.webhookURL = obj && obj.webhookURL.replace(/\/?$/, '/') || '';
        this.emitter = new EventEmitter();
        this.parser = new Parser_1.Parser(this.serviceName(), this.serviceID, this.logLevel);
        this.logger = new utils_1.Logger('adapter', this.logLevel);
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
    serviceName() {
        return 'callr';
    }
    serviceId() {
        return this.serviceID;
    }
    getRouter() {
        if (this.webhookServer) {
            return false;
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
        if (!this.webhookURL) {
            return Rx_1.Observable.throw(new Error('webhookURL should exist.'));
        }
        this.connected = true;
        this.session = new Callr.api(this.token, this.tokenSecret);
        if (this.webhookServer) {
            this.webhookServer.listen();
        }
        return Rx_1.Observable.fromPromise(new Promise((resolve, reject) => {
            this.session
                .call('webhooks.subscribe', 'sms.mo', this.webhookURL, null)
                .success(() => resolve(true))
                .error((error) => {
                this.logger.warning(error);
                if (R.contains(error.message, ['TYPE_ENDPOINT_DUPLICATE', 'HTTP_CODE_ERROR'])) {
                    resolve(null);
                }
                reject(error);
            });
        })
            .then(() => ({ type: 'connected', serviceID: this.serviceId() })));
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
                content = R.path(['object', 'url'], data) ||
                    R.path(['object', 'content'], data)
                    || R.path(['object', 'name'], data);
            }
            if (objectType === 'Note' || objectType === 'Image' || objectType === 'Video') {
                return new Promise((resolve, reject) => {
                    return this.session.call('sms.send', this.username, toNumber, content, null)
                        .success(() => resolve({ type: 'sent', serviceID: this.serviceId() }))
                        .error((error) => reject(error));
                });
            }
            return Promise.reject(new Error('Note, Image, Video are only supported.'));
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
            res.send('');
        });
        return router;
    }
}
exports.Adapter = Adapter;

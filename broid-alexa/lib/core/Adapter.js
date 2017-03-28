"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schemas_1 = require("@broid/schemas");
const utils_1 = require("@broid/utils");
const Promise = require("bluebird");
const events_1 = require("events");
const express_1 = require("express");
const uuid = require("node-uuid");
const R = require("ramda");
const Rx_1 = require("rxjs/Rx");
const Parser_1 = require("./Parser");
const WebHookServer_1 = require("./WebHookServer");
class Adapter {
    constructor(obj) {
        this.serviceID = obj && obj.serviceID || uuid.v4();
        this.logLevel = obj && obj.logLevel || 'info';
        this.emitter = new events_1.EventEmitter();
        this.parser = new Parser_1.Parser(this.serviceName(), this.serviceID, this.logLevel);
        this.logger = new utils_1.Logger('adapter', this.logLevel);
        this.router = this.setupRouter();
        if (obj && obj.http) {
            this.webhookServer = new WebHookServer_1.WebHookServer(obj.http, this.router, this.logLevel);
        }
    }
    serviceName() {
        return 'alexa';
    }
    getRouter() {
        if (this.webhookServer) {
            return null;
        }
        return this.router;
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
        if (this.webhookServer) {
            this.webhookServer.listen();
        }
        return Rx_1.Observable.of(({ type: 'connected', serviceID: this.serviceId() }));
    }
    disconnect() {
        this.connected = false;
        if (this.webhookServer) {
            return this.webhookServer.close();
        }
        return Promise.resolve(null);
    }
    listen() {
        return Rx_1.Observable.fromEvent(this.emitter, 'message')
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
            const content = data.object.content;
            const to = data.to.id;
            let outputSpeech = {
                text: content,
                type: 'PlainText',
            };
            if (content.startsWith('<speak>') && content.endsWith('</speak>')) {
                outputSpeech = {
                    ssml: content,
                    type: 'SSML',
                };
            }
            const card = {
                content,
                title: data.object.name || '',
                type: 'Simple',
            };
            const response = {
                response: {
                    card,
                    outputSpeech,
                    shouldEndSession: true,
                },
            };
            this.emitter.emit(`response:${to}`, response);
            return Promise.resolve({ type: 'sent', serviceID: this.serviceId() });
        });
    }
    setupRouter() {
        const router = express_1.Router();
        const handle = (req, res) => {
            const request = req.body.request;
            const session = req.body.session;
            const requestType = request.type;
            const intentName = requestType === 'IntentRequest'
                ? R.path(['intent', 'name'], request) :
                requestType;
            const messageID = uuid.v4();
            const message = {
                application: session.application,
                intentName,
                messageID,
                requestType,
                slots: R.path(['intent', 'slots'], request) || {},
                user: session.user,
            };
            const responseListener = (data) => res.json(data);
            this.emitter.emit('message', message);
            this.emitter.once(`response:${messageID}`, responseListener);
            setTimeout(() => this.emitter.removeListener(`response:${messageID}`, responseListener), 60000);
            res.sendStatus(200);
        };
        router.get('/', handle);
        router.post('/', handle);
        return router;
    }
}
exports.Adapter = Adapter;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schemas_1 = require("@broid/schemas");
const utils_1 = require("@broid/utils");
const Promise = require("bluebird");
const uuid = require("node-uuid");
const Rx_1 = require("rxjs/Rx");
const Parser_1 = require("./Parser");
const WebHookServer_1 = require("./WebHookServer");
class Adapter {
    constructor(obj) {
        this.serviceID = obj && obj.serviceID || uuid.v4();
        this.logLevel = obj && obj.logLevel || 'info';
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
            this.webhookServer.emit(`response:${to}`, response);
            return Promise.resolve({ type: 'sent', serviceID: this.serviceId() });
        });
    }
}
exports.Adapter = Adapter;

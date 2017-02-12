"use strict";
const Promise = require("bluebird");
const broid_schemas_1 = require("broid-schemas");
const broid_utils_1 = require("broid-utils");
const uuid = require("node-uuid");
const Rx_1 = require("rxjs/Rx");
const parser_1 = require("./parser");
const webHookServer_1 = require("./webHookServer");
class Adapter {
    constructor(obj) {
        this.serviceID = obj && obj.serviceID || uuid.v4();
        this.logLevel = obj && obj.logLevel || "info";
        const HTTPOptions = {
            host: "127.0.0.1",
            port: 8080,
        };
        this.HTTPOptions = obj && obj.http || HTTPOptions;
        this.HTTPOptions.host = this.HTTPOptions.host || HTTPOptions.host;
        this.HTTPOptions.port = this.HTTPOptions.port || HTTPOptions.port;
        this.parser = new parser_1.default(this.serviceID, this.logLevel);
        this.logger = new broid_utils_1.Logger("adapter", this.logLevel);
    }
    users() {
        return Promise.reject(new Error("Not supported"));
    }
    channels() {
        return Promise.reject(new Error("Not supported"));
    }
    serviceId() {
        return this.serviceID;
    }
    connect() {
        if (this.connected) {
            return Rx_1.Observable.of({ type: "connected", serviceID: this.serviceId() });
        }
        this.connected = true;
        this.webhookServer = new webHookServer_1.default(this.HTTPOptions, this.logLevel);
        this.webhookServer.listen();
        return Rx_1.Observable.of(({ type: "connected", serviceID: this.serviceId() }));
    }
    disconnect() {
        return Promise.reject(new Error("Not supported"));
    }
    listen() {
        if (!this.webhookServer) {
            return Rx_1.Observable.throw(new Error("No webhookServer found."));
        }
        return Rx_1.Observable.fromEvent(this.webhookServer, "message")
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
        this.logger.debug("sending", { message: data });
        return broid_schemas_1.default(data, "send")
            .then(() => {
            if (data.object.type !== "Note") {
                return Promise.reject(new Error("Only Note is supported."));
            }
            const content = data.object.content;
            const to = data.to.id;
            let outputSpeech = {
                text: content,
                type: "PlainText",
            };
            if (content.startsWith("<speak>") && content.endsWith("</speak>")) {
                outputSpeech = {
                    ssml: content,
                    type: "SSML",
                };
            }
            const card = {
                content,
                title: data.object.name || "",
                type: "Simple",
            };
            const response = {
                response: {
                    card,
                    outputSpeech,
                    shouldEndSession: true,
                },
            };
            this.webhookServer.emit(`response:${to}`, response);
            return Promise.resolve({ type: "sent", serviceID: this.serviceId() });
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Adapter;

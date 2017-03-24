"use strict";
const Promise = require("bluebird");
const schemas_1 = require("@broid/schemas");
const utils_1 = require("@broid/utils");
const uuid = require("node-uuid");
const R = require("ramda");
const Rx_1 = require("rxjs/Rx");
const parser_1 = require("./parser");
const webHookServer_1 = require("./webHookServer");
const events = [
    "assistant.intent.action.MAIN",
    "assistant.intent.action.TEXT",
    "assistant.intent.action.PERMISSION",
];
class Adapter {
    constructor(obj) {
        this.serviceID = obj && obj.serviceID || uuid.v4();
        this.logLevel = obj && obj.logLevel || "info";
        this.token = obj && obj.token || null;
        this.tokenSecret = obj && obj.tokenSecret || null;
        this.username = obj && obj.username || "";
        const HTTPOptions = {
            host: "127.0.0.1",
            port: 8080,
        };
        this.HTTPOptions = obj && obj.http || HTTPOptions;
        this.HTTPOptions.host = this.HTTPOptions.host || HTTPOptions.host;
        this.HTTPOptions.port = this.HTTPOptions.port || HTTPOptions.port;
        this.parser = new parser_1.default(this.serviceID, this.username, this.logLevel);
        this.logger = new utils_1.Logger("adapter", this.logLevel);
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
        if (!this.username || this.username === "") {
            return Rx_1.Observable.throw(new Error("Username should exist."));
        }
        this.webhookServer = new webHookServer_1.default(this.HTTPOptions, this.logLevel);
        R.forEach((event) => this.webhookServer.addIntent(event), events);
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
        const fromEvents = R.map((event) => Rx_1.Observable.fromEvent(this.webhookServer, event), events);
        return Rx_1.Observable.merge(...fromEvents)
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
        return schemas_1.default(data, "send")
            .then(() => {
            let ssml = false;
            const content = R.path(["object", "content"], data)
                || R.path(["object", "name"], data);
            const type = R.path(["object", "type"], data);
            if (content.startsWith("<speak>") && content.endsWith("</speak>")) {
                ssml = true;
            }
            const noInputs = [];
            if (type === "Note") {
                return this.webhookServer.send(ssml, content, noInputs)
                    .then(() => ({ type: "sent", serviceID: this.serviceId() }));
            }
            return Promise.reject(new Error("Note is only supported."));
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Adapter;

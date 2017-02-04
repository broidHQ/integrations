"use strict";
const Promise = require("bluebird");
const broid_utils_1 = require("broid-utils");
const broid_schemas_1 = require("broid-schemas");
const uuid = require("node-uuid");
const R = require("ramda");
const Rx_1 = require("rxjs/Rx");
const twilio = require("twilio");
const parser_1 = require("./parser");
const webHookServer_1 = require("./webHookServer");
class Adapter {
    constructor(obj) {
        this.serviceID = obj && obj.serviceID || uuid.v4();
        this.logLevel = obj && obj.logLevel || "info";
        this.token = obj && obj.token || null;
        this.tokenSecret = obj && obj.tokenSecret || null;
        this.username = obj && obj.username || "SMS";
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
        if (!this.token
            || !this.tokenSecret) {
            return Rx_1.Observable.throw(new Error("Credentials should exist."));
        }
        this.session = new twilio.RestClient(this.token, this.tokenSecret);
        this.webhookServer = new webHookServer_1.default(this.HTTPOptions, this.logLevel);
        this.webhookServer.listen();
        return Rx_1.Observable.of({ type: "connected", serviceID: this.serviceId() });
    }
    disconnect() {
        return Promise.reject(new Error("Not supported"));
    }
    listen() {
        if (!this.session) {
            return Rx_1.Observable.throw(new Error("No session found."));
        }
        return Rx_1.Observable.fromEvent(this.webhookServer, "message")
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
        this.logger.debug("sending", { message: data });
        return broid_schemas_1.default(data, "send")
            .then(() => {
            const toNumber = R.path(["to", "id"], data)
                || R.path(["to", "name"], data);
            const type = R.path(["object", "type"], data);
            let content = R.path(["object", "content"], data)
                || R.path(["object", "name"], data);
            if (type === "Image" || type === "Video") {
                content = R.path(["object", "url"], data) || R.path(["object", "content"], data)
                    || R.path(["object", "name"], data);
            }
            if (type === "Note" || type === "Image" || type === "Video") {
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
                        return resolve({ type: "sent", serviceID: this.serviceId() });
                    });
                });
            }
            return Promise.reject(new Error("Only Note, Image, and Video are supported."));
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Adapter;

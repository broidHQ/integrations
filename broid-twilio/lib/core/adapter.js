"use strict";
const Promise = require("bluebird");
const broid_schemas_1 = require("broid-schemas");
const broid_utils_1 = require("broid-utils");
const events_1 = require("events");
const express_1 = require("express");
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
        this.parser = new parser_1.default(this.serviceName(), this.serviceID, this.logLevel);
        this.logger = new broid_utils_1.Logger("adapter", this.logLevel);
        this.emitter = new events_1.EventEmitter();
        this.router = this.setupRouter();
        if (obj.http) {
            this.webhookServer = new webHookServer_1.default(obj.http, this.router, this.logLevel);
        }
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
    serviceName() {
        return "twilio";
    }
    getRouter() {
        return this.router;
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
        if (this.webhookServer) {
            this.webhookServer.listen();
        }
        return Rx_1.Observable.of({ type: "connected", serviceID: this.serviceId() });
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
            return Rx_1.Observable.throw(new Error("No session found."));
        }
        return Rx_1.Observable.fromEvent(this.emitter, "message")
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
    setupRouter() {
        const router = express_1.Router();
        router.post("/", (req, res) => {
            const event = {
                request: req,
                response: res,
            };
            this.emitter.emit("message", event);
            const twiml = new twilio.TwimlResponse();
            res.type("text/xml");
            res.send(twiml.toString());
        });
        return router;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Adapter;

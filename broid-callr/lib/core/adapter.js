"use strict";
const Promise = require("bluebird");
const broid_schemas_1 = require("broid-schemas");
const broid_utils_1 = require("broid-utils");
const Callr = require("callr");
const EventEmitter = require("eventemitter3");
const express_1 = require("express");
const uuid = require("node-uuid");
const R = require("ramda");
const Rx_1 = require("rxjs/Rx");
const parser_1 = require("./parser");
const webHookServer_1 = require("./webHookServer");
class Adapter {
    constructor(obj) {
        this.serviceID = obj && obj.serviceID || uuid.v4();
        this.logLevel = obj && obj.logLevel || "info";
        this.token = obj && obj.token || null;
        this.tokenSecret = obj && obj.tokenSecret || null;
        this.username = obj && obj.username || "SMS";
        this.webhookURL = obj && obj.webhookURL.replace(/\/?$/, "/") || "";
        this.emitter = new EventEmitter();
        this.parser = new parser_1.default(this.serviceName(), this.serviceID, this.logLevel);
        this.logger = new broid_utils_1.Logger("adapter", this.logLevel);
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
    serviceName() {
        return "callr";
    }
    serviceId() {
        return this.serviceID;
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
        if (!this.webhookURL) {
            return Rx_1.Observable.throw(new Error("webhookURL should exist."));
        }
        this.session = new Callr.api(this.token, this.tokenSecret);
        if (this.webhookServer) {
            this.webhookServer.listen();
        }
        return Rx_1.Observable.fromPromise(new Promise((resolve, reject) => {
            this.session
                .call("webhooks.subscribe", "sms.mo", this.webhookURL, null)
                .success(() => resolve(true))
                .error((error) => {
                this.logger.warning(error);
                if (R.contains(error.message, ["TYPE_ENDPOINT_DUPLICATE", "HTTP_CODE_ERROR"])) {
                    resolve(null);
                }
                reject(error);
            });
        })
            .then(() => ({ type: "connected", serviceID: this.serviceId() })));
    }
    disconnect() {
        if (this.webhookServer) {
            return this.webhookServer.close();
        }
        return Promise.resolve();
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
                return new Promise((resolve, reject) => {
                    return this.session.call("sms.send", this.username, toNumber, content, null)
                        .success(() => resolve({ type: "sent", serviceID: this.serviceId() }))
                        .error((error) => reject(error));
                });
            }
            return Promise.reject(new Error("Note, Image, Video are only supported."));
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
            res.send("");
        });
        return router;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Adapter;

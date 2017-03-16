"use strict";
const Promise = require("bluebird");
const broid_schemas_1 = require("broid-schemas");
const broid_utils_1 = require("broid-utils");
const events_1 = require("events");
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
        this.emitter = new events_1.EventEmitter();
        this.parser = new parser_1.default(this.serviceName(), this.serviceID, this.logLevel);
        this.logger = new broid_utils_1.Logger("adapter", this.logLevel);
        this.router = this.setupRouter();
        if (obj.http) {
            this.webhookServer = new webHookServer_1.default(obj.http, this.router, this.logLevel);
        }
    }
    serviceName() {
        return "alexa";
    }
    getRouter() {
        if (this.webhookServer) {
            return false;
        }
        return this.router;
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
        if (this.webhookServer) {
            this.connected = true;
            this.webhookServer.listen();
        }
        return Rx_1.Observable.of(({ type: "connected", serviceID: this.serviceId() }));
    }
    disconnect() {
        if (this.webhookServer) {
            return this.webhookServer.close();
        }
        return Promise.resolve();
    }
    listen() {
        return Rx_1.Observable.fromEvent(this.emitter, "message")
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
            this.emitter.emit(`response:${to}`, response);
            return Promise.resolve({ type: "sent", serviceID: this.serviceId() });
        });
    }
    setupRouter() {
        const router = express_1.Router();
        const handle = (req, res) => {
            const request = req.body.request;
            const session = req.body.session;
            const requestType = request.type;
            const intentName = requestType === "IntentRequest"
                ? R.path(["intent", "name"], request) :
                requestType;
            const messageID = uuid.v4();
            const message = {
                application: session.application,
                intentName,
                messageID,
                requestType,
                slots: R.path(["intent", "slots"], request) || {},
                user: session.user,
            };
            const responseListener = (data) => res.json(data);
            this.emitter.emit("message", message);
            this.emitter.once(`response:${messageID}`, responseListener);
            setTimeout(() => this.emitter.removeListener(`response:${messageID}`, responseListener), 60000);
            res.sendStatus(200);
        };
        router.get("/", handle);
        router.post("/", handle);
        return router;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Adapter;

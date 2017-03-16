"use strict";
const actionsSdk = require("actions-on-google");
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
        this.actionsMap = new Map();
        this.emitter = new events_1.EventEmitter();
        this.parser = new parser_1.default(this.serviceName(), this.serviceID, this.username, this.logLevel);
        this.logger = new broid_utils_1.Logger("adapter", this.logLevel);
        this.router = this.setupRouter();
        if (obj.http) {
            this.webhookServer = new webHookServer_1.default(obj.http, this.router, this.logLevel);
        }
    }
    serviceName() {
        return "google-assistant";
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
    getRouter() {
        if (this.webhookServer) {
            return false;
        }
        return this.router;
    }
    connect() {
        if (this.connected) {
            return Rx_1.Observable.of({ type: "connected", serviceID: this.serviceId() });
        }
        if (!this.username || this.username === "") {
            return Rx_1.Observable.throw(new Error("Username should exist."));
        }
        this.connected = true;
        R.forEach((event) => this.addIntent(event), events);
        if (this.webhookServer) {
            this.webhookServer.listen();
        }
        return Rx_1.Observable.of(({ type: "connected", serviceID: this.serviceId() }));
    }
    disconnect() {
        if (this.webhookServer) {
            return this.webhookServer.close().then(() => true);
        }
        return Promise.resolve(true);
    }
    listen() {
        const fromEvents = R.map((event) => Rx_1.Observable.fromEvent(this.emitter, event), events);
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
        return broid_schemas_1.default(data, "send")
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
                return this.sendMessage(ssml, content, noInputs)
                    .then(() => ({ type: "sent", serviceID: this.serviceId() }));
            }
            return Promise.reject(new Error("Note is only supported."));
        });
    }
    addIntent(trigger) {
        this.actionsMap.set(trigger, () => {
            const body = this.assistant.body_;
            const conversationId = this.assistant.getConversationId();
            let deviceLocation = null;
            const intent = this.assistant.getIntent();
            const user = this.assistant.getUser();
            const userInput = this.assistant.getRawInput();
            if (this.assistant.isPermissionGranted()) {
                deviceLocation = this.assistant.getDeviceLocation();
            }
            this.emitter.emit(trigger, {
                body,
                conversationId,
                deviceLocation,
                intent,
                user,
                userInput,
            });
        });
    }
    setupRouter() {
        const router = express_1.Router();
        router.post("/", (req, res) => {
            this.assistant = new actionsSdk.ActionsSdkAssistant({ request: req, response: res });
            this.assistant.handleRequest(this.actionsMap);
            res.sendStatus(200);
        });
        return router;
    }
    sendMessage(isSSML, content, noInputs) {
        const inputPrompt = this.assistant.buildInputPrompt(isSSML, content, noInputs);
        this.assistant.ask(inputPrompt);
        return Promise.resolve(true);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Adapter;

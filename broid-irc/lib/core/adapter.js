"use strict";
const Promise = require("bluebird");
const schemas_1 = require("@broid/schemas");
const utils_1 = require("@broid/utils");
const events_1 = require("events");
const irc = require("irc");
const uuid = require("node-uuid");
const Rx_1 = require("rxjs/Rx");
const parser_1 = require("./parser");
class Adapter {
    constructor(obj) {
        this.serviceID = obj && obj.serviceID || uuid.v4();
        this.logLevel = obj && obj.logLevel || "info";
        this.connectTimeout = obj && obj.connectTimeout || 60000;
        this.address = obj && obj.address;
        this.username = obj && obj.username;
        this.channels = obj && obj.channels;
        this.ee = new events_1.EventEmitter();
        this.parser = new parser_1.default(this.username, this.serviceID, this.logLevel);
        this.logger = new utils_1.Logger("adapter", this.logLevel);
    }
    serviceId() {
        return this.serviceID;
    }
    connect() {
        if (!this.address) {
            return Rx_1.Observable.throw(new Error("IRC address is not set"));
        }
        if (!this.username) {
            return Rx_1.Observable.throw(new Error("IRC username is not set"));
        }
        this.client = Promise.promisifyAll(new irc.Client(this.address, this.username, {
            autoConnect: false,
            channels: this.channels,
        }));
        const connect = this.client.connectAsync()
            .catch((err) => {
            if (err.rawCommand !== "001") {
                throw err;
            }
        })
            .then(() => {
            this.client.addListener("message", (from, to, message) => {
                this.ee.emit("message", { from, to, message });
            });
            return Rx_1.Observable.of({ type: "connected", serviceID: this.serviceId() });
        });
        return Rx_1.Observable.fromPromise(connect)
            .timeout(this.connectTimeout);
    }
    disconnect() {
        return this.client.disconnectAsync();
    }
    listen() {
        return Rx_1.Observable.fromEvent(this.ee, "message")
            .map((normalized) => this.parser.parse(normalized))
            .map((parsed) => this.parser.validate(parsed))
            .map((validated) => {
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
            const message = data.object.content;
            let to = data.to.id;
            if (data.to.type === "Group" && !to.includes("#")) {
                to = `#${to}`;
            }
            this.client.say(to, message);
            return { type: "sent", serviceID: this.serviceId() };
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Adapter;

"use strict";
const Promise = require("bluebird");
const schemas_1 = require("@broid/schemas");
const utils_1 = require("@broid/utils");
const uuid = require("node-uuid");
const PromiseMemoize = require("promise-memoize");
const R = require("ramda");
const Rx_1 = require("rxjs/Rx");
const client_1 = require("./client");
const parser_1 = require("./parser");
const webHookServer_1 = require("./webHookServer");
class Adapter {
    constructor(obj) {
        this.serviceID = obj && obj.serviceID || uuid.v4();
        this.logLevel = obj && obj.logLevel || "info";
        this.token = obj && obj.token || "";
        this.tokenSecret = obj && obj.tokenSecret || "";
        this.username = obj && obj.username || "";
        const HTTPOptions = {
            host: "127.0.0.1",
            port: 8080,
        };
        this.HTTPOptions = obj && obj.http || HTTPOptions;
        this.HTTPOptions.host = this.HTTPOptions.host || HTTPOptions.host;
        this.HTTPOptions.port = this.HTTPOptions.port || HTTPOptions.port;
        if (this.token === "") {
            throw new Error("Token should exist.");
        }
        if (this.tokenSecret === "") {
            throw new Error("TokenSecret should exist.");
        }
        if (this.username === "") {
            throw new Error("username should exist.");
        }
        this.parser = new parser_1.default(this.serviceID, this.logLevel);
        this.logger = new utils_1.Logger("adapter", this.logLevel);
    }
    users() {
        return Promise.reject(new Error("Not supported"));
    }
    channels() {
        const getGroupCached = PromiseMemoize(client_1.getGroups, { maxAge: 350000 });
        return getGroupCached(this.tokenSecret)
            .then(R.map((channel) => {
            return {
                created_at: channel.created_at,
                id: channel.id,
                members: R.map((member) => ({
                    avatar: member.image_url,
                    id: member.user_id,
                    username: member.nickname,
                }), channel.members),
                name: channel.name,
                type: channel.type,
                updated_at: channel.updated_at,
            };
        }));
    }
    serviceId() {
        return this.serviceID;
    }
    connect() {
        if (this.connected) {
            return Rx_1.Observable.of({ type: "connected", serviceID: this.serviceId() });
        }
        this.connected = true;
        this.webhookServer = new webHookServer_1.default(this.username, this.HTTPOptions, this.logLevel);
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
            .mergeMap((event) => {
            return this.channels()
                .filter((group) => group.id === R.path(["body", "group_id"], event))
                .then((group) => R.assoc("group", group, event));
        })
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
            if (data.object.type !== "Note" && data.object.type !== "Image") {
                return Promise.reject(new Error("Only Note or Image is supported."));
            }
            return Promise.resolve(data)
                .then((result) => {
                const type = R.path(["object", "type"], data);
                const content = R.path(["object", "content"], result);
                const payload = {
                    bot_id: this.token,
                    text: content,
                };
                if (type === "Image") {
                    payload.image = {
                        mediaType: R.path(["object", "mediaType"], data),
                        url: R.path(["object", "url"], data),
                    };
                }
                return client_1.postMessage(this.tokenSecret, payload);
            })
                .then(() => ({ type: "sent", serviceID: this.serviceId() }));
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Adapter;

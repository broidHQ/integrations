"use strict";
const KikBot = require("@kikinteractive/kik");
const Promise = require("bluebird");
const broid_schemas_1 = require("broid-schemas");
const broid_utils_1 = require("broid-utils");
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
        this.username = obj && obj.username || "SMS";
        this.storeUsers = new Map();
        const HTTPOptions = {
            host: "127.0.0.1",
            port: 8080,
            webhookURL: "http://127.0.0.1/",
        };
        this.HTTPOptions = obj && obj.http || HTTPOptions;
        this.HTTPOptions.host = this.HTTPOptions.host || HTTPOptions.host;
        this.HTTPOptions.port = this.HTTPOptions.port || HTTPOptions.port;
        this.HTTPOptions.webhookURL = this.HTTPOptions.webhookURL || HTTPOptions.webhookURL;
        this.HTTPOptions.webhookURL = this.HTTPOptions.webhookURL
            .replace(/\/?$/, "/");
        this.parser = new parser_1.default(this.serviceID, this.logLevel);
        this.logger = new broid_utils_1.Logger("adapter", this.logLevel);
    }
    users() {
        return Promise.resolve(this.storeUsers);
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
        if (!this.token || !this.username || !this.HTTPOptions.webhookURL) {
            return Rx_1.Observable.throw(new Error("Credentials should exist."));
        }
        this.session = new KikBot({
            apiKey: this.token,
            baseUrl: this.HTTPOptions.webhookURL,
            username: this.username,
        });
        this.webhookServer = new webHookServer_1.default(this.HTTPOptions, this.logLevel);
        this.webhookServer.listen(this.session.incoming());
        return Rx_1.Observable.of({ type: "connected", serviceID: this.serviceId() });
    }
    disconnect() {
        return Promise.reject(new Error("Not supported"));
    }
    listen() {
        if (!this.session) {
            return Rx_1.Observable.throw(new Error("No session found."));
        }
        this.session.updateBotConfiguration();
        return Rx_1.Observable.create((observer) => {
            this.session.use((incoming, next) => {
                next();
                this.user(incoming.from, true)
                    .then((userInformation) => this.parser.normalize(incoming, userInformation))
                    .then((normalized) => this.parser.parse(normalized))
                    .then((parsed) => this.parser.validate(parsed))
                    .then((validated) => {
                    if (validated) {
                        observer.next(validated);
                    }
                    return null;
                });
            });
        });
    }
    send(data) {
        this.logger.debug("sending", { message: data });
        return broid_schemas_1.default(data, "send")
            .then(() => {
            const toID = R.path(["to", "id"], data)
                || R.path(["to", "name"], data);
            const type = R.path(["object", "type"], data);
            const attachments = R.path(["object", "attachment"], data);
            let buttons = R.filter((attachment) => attachment.type === "Button", attachments || []);
            buttons = R.map((button) => button.url || button.name, buttons);
            buttons = R.reject(R.isNil)(buttons);
            return Promise.resolve(buttons)
                .then((btns) => {
                if (type === "Image" || type === "Video") {
                    const url = R.path(["object", "url"], data);
                    const name = R.path(["object", "name"], data) || "";
                    let message = KikBot.Message.picture(url)
                        .setAttributionName(name)
                        .setAttributionIcon(R.path(["object", "preview"], data) || url);
                    if (type === "Video") {
                        message = KikBot.Message.video(url)
                            .setAttributionName(name)
                            .setAttributionIcon(R.path(["object", "preview"], data));
                    }
                    return [btns, message];
                }
                else if (type === "Note") {
                    return [btns, KikBot.Message.text(R.path(["object", "content"], data))];
                }
                return [null, null];
            })
                .spread((btns, content) => {
                if (content) {
                    if (btns && !R.isEmpty(btns)) {
                        content.addResponseKeyboard(btns, false, toID);
                    }
                    return this.session.send(content, toID)
                        .then(() => ({ type: "sent", serviceID: this.serviceId() }));
                }
                throw new Error("Only Note, Image, and Video are supported.");
            });
        });
    }
    user(key, cache = true) {
        if (!this.session) {
            return Promise.reject(new Error("Session should be initilized before."));
        }
        if (cache && this.storeUsers.get(key)) {
            const data = this.storeUsers.get(key);
            return Promise.resolve(data);
        }
        return this.session.getUserProfile(key)
            .then((profile) => {
            return {
                displayName: profile.displayName,
                firstName: profile.firstName,
                id: key,
                lastName: profile.lastName,
                profilePicLastModified: profile.profilePicLastModified,
                profilePicUrl: profile.profilePicUrl,
                username: profile.username,
            };
        })
            .then((data) => {
            this.storeUsers.set(key, data);
            return data;
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Adapter;

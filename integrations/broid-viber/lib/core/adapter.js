"use strict";
const Promise = require("bluebird");
const broid_schemas_1 = require("broid-schemas");
const broid_utils_1 = require("broid-utils");
const http = require("http");
const uuid = require("node-uuid");
const R = require("ramda");
const Rx_1 = require("rxjs/Rx");
const viber_bot_1 = require("viber-bot");
const parser_1 = require("./parser");
class Adapter {
    constructor(obj) {
        this.serviceID = obj && obj.serviceID || uuid.v4();
        this.logLevel = obj && obj.logLevel || "info";
        this.token = obj && obj.token || null;
        this.username = obj && obj.username || null;
        this.avatar = obj && obj.avatar || "";
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
        this.storeUsers = new Map();
        this.parser = new parser_1.default(this.serviceID, this.logLevel);
        this.logger = new broid_utils_1.Logger("adapter", this.logLevel);
    }
    users() {
        return Promise.reject(this.storeUsers);
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
            || !this.username) {
            return Rx_1.Observable.throw(new Error("Credentials should exist."));
        }
        this.session = new viber_bot_1.Bot({
            authToken: this.token,
            avatar: this.avatar,
            name: this.username,
        });
        this.webhookServer = http.createServer(this.session.middleware())
            .listen(this.HTTPOptions.port, this.HTTPOptions.host, () => this.session.setWebhook(this.HTTPOptions.webhookURL)
            .then(() => this.logger.info(`Server listening at port ${this.HTTPOptions.host}:${this.HTTPOptions.port}...`))
            .catch((e) => {
            this.logger.error(e);
            this.webhookServer.close();
        }));
        return Rx_1.Observable.of({ type: "connected", serviceID: this.serviceId() });
    }
    disconnect() {
        return Promise.reject(new Error("Not supported"));
    }
    listen() {
        if (!this.session) {
            return Rx_1.Observable.throw(new Error("No session found."));
        }
        return Rx_1.Observable.fromEvent(this.session, viber_bot_1.Events.MESSAGE_RECEIVED, (...args) => ({ message: args[0], user_profile: args[1].userProfile }))
            .mergeMap((event) => this.parser.normalize(event))
            .mergeMap((normalized) => {
            if (!normalized) {
                return Promise.resolve(null);
            }
            const id = R.path(["author", "id"], normalized);
            if (id) {
                this.storeUsers.set(id, normalized.author);
            }
            if (this.me) {
                normalized.target = this.me;
                return Promise.resolve(normalized);
            }
            return this.session.getBotProfile()
                .then((profile) => {
                this.me = R.assoc("_isMe", true, profile);
                normalized.target = this.me;
                return normalized;
            });
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
        return broid_schemas_1.default(data, "send")
            .then(() => {
            if (R.path(["to", "type"], data) !== "Person") {
                return Promise.reject(new Error("Message to a Person is only supported."));
            }
            return data;
        })
            .then((message) => {
            const content = R.path(["object", "content"], message);
            const type = R.path(["object", "type"], message);
            const attachments = R.pathOr([], ["object", "attachment"], message);
            const attachmentsButtons = R.filter((attachment) => attachment.type === "Button", attachments);
            let keyboard = null;
            if (attachmentsButtons && !R.isEmpty(attachmentsButtons)) {
                keyboard = {
                    Buttons: R.map((attachment) => {
                        let actionType = "reply";
                        if (attachment.mediaType === "text/html") {
                            actionType = "open-url";
                        }
                        return {
                            ActionBody: attachment.url,
                            ActionType: actionType,
                            BgColor: "#2db9b9",
                            Text: attachment.name || attachment.content,
                        };
                    }, attachmentsButtons),
                    DefaultHeight: true,
                    Type: "keyboard",
                };
            }
            if (type === "Note") {
                return [new viber_bot_1.Message.Text(content, keyboard), message];
            }
            else if (type === "Image" || type === "Video") {
                const url = R.path(["object", "url"], message);
                const preview = R.path(["object", "preview"], message);
                if (type === "Image") {
                    return [new viber_bot_1.Message.Picture(url, content, preview, keyboard), message];
                }
                else {
                    return [new viber_bot_1.Message.Video(url, null, preview, null, keyboard), message];
                }
            }
            else if (type === "Place") {
                const latitude = R.path(["object", "latitude"], message);
                const longitude = R.path(["object", "longitude"], message);
                return [new viber_bot_1.Message.Location(latitude, longitude, keyboard), message];
            }
            return [null, message];
        })
            .spread((messageBuilder, message) => {
            if (messageBuilder) {
                const toID = R.path(["to", "id"], message);
                return this.session.sendMessage({ id: toID }, messageBuilder)
                    .then(() => ({ type: "sended", serviceID: this.serviceId() }));
            }
            return Promise.reject(new Error("Note, Image, Video are only supported."));
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Adapter;

"use strict";
const Promise = require("bluebird");
const broid_schemas_1 = require("broid-schemas");
const broid_utils_1 = require("broid-utils");
const uuid = require("node-uuid");
const R = require("ramda");
const rp = require("request-promise");
const Rx_1 = require("rxjs/Rx");
const parser_1 = require("./parser");
const webHookServer_1 = require("./webHookServer");
class Adapter {
    constructor(obj) {
        this.serviceID = obj && obj.serviceID || uuid.v4();
        this.logLevel = obj && obj.logLevel || "info";
        this.token = obj && obj.token || null;
        this.tokenSecret = obj && obj.tokenSecret || null;
        this.storeUsers = new Map();
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
        if (!this.token
            || !this.tokenSecret) {
            return Rx_1.Observable.throw(new Error("Credentials should exist."));
        }
        this.connected = true;
        this.webhookServer = new webHookServer_1.default(this.tokenSecret, this.HTTPOptions, this.logLevel);
        this.webhookServer.listen();
        return Rx_1.Observable.of({ type: "connected", serviceID: this.serviceId() });
    }
    disconnect() {
        return Promise.reject(new Error("Not supported"));
    }
    listen() {
        return Rx_1.Observable.fromEvent(this.webhookServer, "message")
            .mergeMap((event) => this.parser.normalize(event))
            .mergeMap((messages) => Rx_1.Observable.from(messages))
            .mergeMap((message) => this.user(message.author)
            .then((author) => {
            message.authorInformation = author;
            return message;
        }))
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
            const toID = R.path(["to", "id"], data)
                || R.path(["to", "name"], data);
            const type = R.path(["object", "type"], data);
            const content = R.path(["object", "content"], data);
            const name = R.path(["object", "name"], data) || content;
            const attachments = R.path(["object", "attachment"], data) || [];
            const buttons = R.filter((attachment) => attachment.type === "Button", attachments);
            let fButtons = R.map((button) => {
                if (!button.mediaType) {
                    return {
                        payload: button.url,
                        title: button.name,
                        type: "postback",
                    };
                }
                else if (button.mediaType === "text/html") {
                    return {
                        title: button.name,
                        type: "web_url",
                        url: button.url,
                    };
                }
                else if (button.mediaType === "audio/telephone-event") {
                    return {
                        payload: button.url,
                        title: button.name,
                        type: "phone_number",
                    };
                }
                return null;
            }, buttons);
            fButtons = R.reject(R.isNil)(fButtons);
            const messageData = {
                message: {
                    attachment: {},
                    text: "",
                },
                recipient: { id: toID },
            };
            if (type === "Image") {
                const attachment = {
                    payload: {
                        elements: [{
                                buttons: !R.isEmpty(fButtons) ? fButtons : null,
                                image_url: R.path(["object", "url"], data),
                                item_url: "",
                                subtitle: content !== name ? content : "",
                                title: name || "",
                            }],
                        template_type: "generic",
                    },
                    type: "template",
                };
                messageData.message.attachment = attachment;
            }
            else if (type === "Video") {
                if (!R.isEmpty(fButtons)) {
                    const attachment = {
                        payload: {
                            elements: [{
                                    buttons: fButtons,
                                    image_url: R.path(["object", "url"], data),
                                    item_url: "",
                                    subtitle: content !== name ? content : "",
                                    title: name || "",
                                }],
                            template_type: "generic",
                        },
                        type: "template",
                    };
                    messageData.message.attachment = attachment;
                }
                else {
                    messageData.message.text = broid_utils_1.concat([
                        R.path(["object", "name"], data) || "",
                        R.path(["object", "content"], data) || "",
                        R.path(["object", "url"], data),
                    ]);
                }
            }
            else if (type === "Note") {
                if (!R.isEmpty(fButtons)) {
                    const attachment = {
                        payload: {
                            elements: [{
                                    buttons: fButtons,
                                    image_url: "",
                                    item_url: "",
                                    subtitle: content || "",
                                    title: name || "",
                                }],
                            template_type: "generic",
                        },
                        type: "template",
                    };
                    messageData.message.attachment = attachment;
                }
                else {
                    messageData.message.text = R.path(["object", "content"], data);
                    delete messageData.message.attachment;
                }
            }
            if (type === "Note" || type === "Image" || type === "Video") {
                return rp({
                    json: messageData,
                    method: "POST",
                    qs: { access_token: this.token },
                    uri: "https://graph.facebook.com/v2.8/me/messages",
                })
                    .then(() => ({ type: "sent", serviceID: this.serviceId() }));
            }
            return Promise.reject(new Error("Only Note, Image, and Video are supported."));
        });
    }
    user(id, fields = "name,first_name,last_name", cache = true) {
        const key = `${id}${fields}`;
        if (cache && this.storeUsers.get(key)) {
            const data = this.storeUsers.get(key);
            return Promise.resolve(data);
        }
        return rp({
            json: true,
            method: "GET",
            qs: { access_token: this.token, fields },
            uri: `https://graph.facebook.com/v2.8/${id}`,
        })
            .then((data) => {
            this.storeUsers.set(key, data);
            return data;
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Adapter;

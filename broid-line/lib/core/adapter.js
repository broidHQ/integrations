"use strict";
const Promise = require("bluebird");
const broid_schemas_1 = require("broid-schemas");
const broid_utils_1 = require("broid-utils");
const LineBot = require("line-messaging");
const uuid = require("node-uuid");
const R = require("ramda");
const Rx_1 = require("rxjs/Rx");
const parser_1 = require("./parser");
class Adapter {
    constructor(obj) {
        this.serviceID = obj && obj.serviceID || uuid.v4();
        this.logLevel = obj && obj.logLevel || "info";
        this.token = obj && obj.token || null;
        this.tokenSecret = obj && obj.tokenSecret || null;
        this.username = obj && obj.username || null;
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
        if (!this.token || !this.tokenSecret || !this.username) {
            return Rx_1.Observable.throw(new Error("Credentials should exist."));
        }
        this.connected = true;
        this.session = LineBot.create({
            channelID: this.username,
            channelSecret: this.tokenSecret,
            channelToken: this.token,
        });
        this.session.webhook("/");
        this.session.listen(this.HTTPOptions.port, this.HTTPOptions.host, () => {
            this.logger.info(`Server listening at port ${this.HTTPOptions.host}:${this.HTTPOptions.port}...`);
        });
        return Rx_1.Observable.of({ type: "connected", serviceID: this.serviceId() });
    }
    disconnect() {
        return Promise.reject(new Error("Not supported"));
    }
    listen() {
        return Rx_1.Observable.merge(Rx_1.Observable
            .fromEvent(this.session, LineBot.Events.MESSAGE, (...args) => args[1].getEvent()), Rx_1.Observable
            .fromEvent(this.session, LineBot.Events.POSTBACK, (...args) => args[1].getEvent()))
            .mergeMap((event) => this.parser.normalize(event))
            .mergeMap((message) => {
            if (R.path(["source", "type"], message) === "user") {
                return this.user(message.source.userId)
                    .then((authorInformation) => R.assoc("source", authorInformation, message));
            }
            return Promise.resolve(message);
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
        const createButtons = (attachments, tpl) => {
            const template = tpl || new LineBot.ButtonTemplateBuilder();
            R.forEach((attachment) => {
                let type = LineBot.Action.POSTBACK;
                if (attachment.mediaType === "text/html") {
                    type = LineBot.Action.URI;
                }
                template.addAction(attachment.content || attachment.name, attachment.url, type);
                return;
            }, attachments);
            return template;
        };
        const createConfirmButton = (attachment) => {
            const template = new LineBot.ConfirmTemplateBuilder();
            template.setMessage(attachment.content || attachment.name);
            template.setPositiveAction(attachment.yesLabel, attachment.yesLabel);
            template.setNegativeAction(attachment.noLabel, attachment.noLabel);
            return template;
        };
        return broid_schemas_1.default(data, "send")
            .then(() => {
            const type = R.path(["object", "type"], data);
            if (type === "Collection") {
                let objects = R.path(["object", "items"], data);
                if (!R.is(Array, objects)) {
                    objects = [objects];
                }
                const columns = R.map((object) => {
                    const column = createButtons(object.attachment || [], new LineBot.CarouselColumnTemplateBuilder());
                    column.setTitle(object.name);
                    column.setMessage(object.content);
                    column.setThumbnail(object.preview || object.url);
                    return column;
                }, objects);
                const carousel = new LineBot.CarouselTemplateBuilder(columns);
                return new LineBot
                    .TemplateMessageBuilder("You can\'t see this rich message.", carousel);
            }
            else {
                const attachments = R.path(["object", "attachment"], data);
                const content = R.path(["object", "content"], data);
                const name = R.path(["object", "name"], data);
                const url = R.path(["object", "url"], data);
                const preview = R.path(["object", "preview"], data);
                if (R.is(Array, attachments) && !R.isEmpty(attachments)) {
                    const attachmentsButtons = R.filter((attachment) => attachment.type === "Button" && R.isEmpty(attachment.attachment || []), attachments);
                    const attachmentsConfirm = R.filter((attachment) => attachment.type === "Button" && !R.isEmpty(attachment.attachment || []), attachments);
                    if (!R.isEmpty(attachmentsConfirm)) {
                        const buttons = createConfirmButton(attachmentsConfirm[0].attachment);
                        return new LineBot.TemplateMessageBuilder(content, buttons);
                    }
                    else if (!R.isEmpty(attachmentsButtons)) {
                        const buttons = createButtons(attachmentsButtons, null);
                        buttons.setTitle(name);
                        buttons.setMessage(content);
                        if (type === "Image" && url) {
                            buttons.setThumbnail(preview || url);
                        }
                        return new LineBot.TemplateMessageBuilder(content, buttons);
                    }
                }
                else if (type === "Note") {
                    return new LineBot.TextMessageBuilder(content);
                }
                else if (type === "Image" || type === "Video") {
                    if (url) {
                        if (type === "Video") {
                            return new LineBot.VideoMessageBuilder(url, preview || url);
                        }
                        return new LineBot.ImageMessageBuilder(url, preview || url);
                    }
                }
                else if (type === "Place") {
                    const latitude = R.path(["object", "latitude"], data);
                    const longitude = R.path(["object", "longitude"], data);
                    return new LineBot.LocationMessageBuilder(name || "Location", content, latitude, longitude);
                }
            }
        })
            .then((messageBuilder) => {
            if (messageBuilder) {
                const replyToken = R.path(["object", "context", "content"], data);
                if (replyToken) {
                    return this.session.replyMessage(replyToken, messageBuilder);
                }
                const channelID = R.path(["to", "id"], data);
                return this.session.pushMessage(channelID, messageBuilder);
            }
            return Promise.reject(new Error("Note, Image, Video are only supported."));
        })
            .then(() => ({ serviceID: this.serviceId(), type: "sent" }));
    }
    user(key, cache = true) {
        if (cache && this.storeUsers.get(key)) {
            const data = this.storeUsers.get(key);
            return Promise.resolve(data);
        }
        return this.session.getProfile(key)
            .then((data) => {
            this.storeUsers.set(key, data);
            return data;
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Adapter;

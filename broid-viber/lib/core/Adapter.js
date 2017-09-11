"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schemas_1 = require("@broid/schemas");
const utils_1 = require("@broid/utils");
const Promise = require("bluebird");
const express_1 = require("express");
const R = require("ramda");
const Rx_1 = require("rxjs/Rx");
const uuid = require("uuid");
const viber_bot_1 = require("viber-bot");
const Parser_1 = require("./Parser");
const WebHookServer_1 = require("./WebHookServer");
class Adapter {
    constructor(obj) {
        this.serviceID = obj && obj.serviceID || uuid.v4();
        this.logLevel = obj && obj.logLevel || 'info';
        this.token = obj && obj.token || null;
        this.username = obj && obj.username || null;
        this.avatar = obj && obj.avatar || '';
        this.webhookURL = obj && obj.webhookURL.replace(/\/?$/, '/') || '';
        this.storeUsers = new Map();
        this.parser = new Parser_1.Parser(this.serviceName(), this.serviceID, this.logLevel);
        this.logger = new utils_1.Logger('adapter', this.logLevel);
        this.router = express_1.Router();
        if (obj.http) {
            this.webhookServer = new WebHookServer_1.WebHookServer(obj.http, this.router, this.logLevel);
        }
    }
    users() {
        return Promise.reject(this.storeUsers);
    }
    channels() {
        return Promise.reject(new Error('Not supported'));
    }
    serviceName() {
        return 'viber';
    }
    serviceId() {
        return this.serviceID;
    }
    getRouter() {
        if (this.webhookServer) {
            return null;
        }
        return this.router;
    }
    connect() {
        if (this.connected) {
            return Rx_1.Observable.of({ type: 'connected', serviceID: this.serviceId() });
        }
        if (!this.token || !this.username) {
            return Rx_1.Observable.throw(new Error('Credentials should exist.'));
        }
        if (!this.webhookURL) {
            return Rx_1.Observable.throw(new Error('webhookURL should exist.'));
        }
        this.connected = true;
        this.session = new viber_bot_1.Bot({
            authToken: this.token,
            avatar: this.avatar,
            name: this.username,
        });
        this.router.post('/', this.session.middleware());
        this.router.get('/', this.session.middleware());
        if (this.webhookServer) {
            this.webhookServer.listen();
        }
        return Rx_1.Observable.fromPromise(new Promise((resolve, reject) => {
            this.session.setWebhook(this.webhookURL)
                .then(() => resolve(true))
                .catch((e) => {
                this.logger.error(e);
                this.disconnect();
                reject(e);
            });
        })
            .then(() => ({ type: 'connected', serviceID: this.serviceId() })));
    }
    disconnect() {
        if (this.webhookServer) {
            return this.webhookServer.close();
        }
        return Promise.resolve(null);
    }
    listen() {
        if (!this.session) {
            return Rx_1.Observable.throw(new Error('No session found.'));
        }
        return Rx_1.Observable.fromEvent(this.session, viber_bot_1.Events.MESSAGE_RECEIVED, (...args) => ({ message: args[0], user_profile: args[1].userProfile }))
            .switchMap((value) => {
            return Rx_1.Observable.of(value)
                .mergeMap((event) => this.parser.normalize(event))
                .mergeMap((normalized) => {
                if (!normalized) {
                    return Promise.resolve(null);
                }
                const id = R.path(['author', 'id'], normalized);
                if (id) {
                    this.storeUsers.set(id, normalized.author);
                }
                if (this.me) {
                    normalized.target = this.me;
                    return Promise.resolve(normalized);
                }
                return this.session.getBotProfile()
                    .then((profile) => {
                    this.me = R.assoc('_isMe', true, profile);
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
            })
                .catch((err) => {
                this.logger.error('Caught Error, continuing', err);
                return Rx_1.Observable.of(err);
            });
        })
            .mergeMap((value) => {
            if (value instanceof Error) {
                return Rx_1.Observable.empty();
            }
            return Promise.resolve(value);
        });
    }
    send(data) {
        this.logger.debug('sending', { message: data });
        return schemas_1.default(data, 'send')
            .then(() => {
            if (R.path(['to', 'type'], data) !== 'Person') {
                return Promise.reject(new Error('Message to a Person is only supported.'));
            }
            return data;
        })
            .then((message) => {
            const content = R.path(['object', 'content'], message);
            const dataType = R.path(['object', 'type'], message);
            const attachments = R.pathOr([], ['object', 'attachment'], message);
            const attachmentsButtons = R.filter((attachment) => attachment.type === 'Button', attachments);
            let keyboard = null;
            if (attachmentsButtons && !R.isEmpty(attachmentsButtons)) {
                keyboard = {
                    Buttons: R.map((attachment) => {
                        let actionType = 'reply';
                        if (attachment.mediaType === 'text/html') {
                            actionType = 'open-url';
                        }
                        return {
                            ActionBody: attachment.url,
                            ActionType: actionType,
                            BgColor: '#2db9b9',
                            Text: attachment.name || attachment.content,
                        };
                    }, attachmentsButtons),
                    DefaultHeight: true,
                    Type: 'keyboard',
                };
            }
            if (dataType === 'Note') {
                return [new viber_bot_1.Message.Text(content, keyboard), message];
            }
            else if (dataType === 'Image' || dataType === 'Video') {
                const url = R.path(['object', 'url'], message);
                const preview = R.path(['object', 'preview'], message);
                if (dataType === 'Image') {
                    return [new viber_bot_1.Message.Picture(url, content, preview, keyboard), message];
                }
                else {
                    return [new viber_bot_1.Message.Video(url, null, preview, null, keyboard), message];
                }
            }
            else if (dataType === 'Place') {
                const latitude = R.path(['object', 'latitude'], message);
                const longitude = R.path(['object', 'longitude'], message);
                return [new viber_bot_1.Message.Location(latitude, longitude, keyboard), message];
            }
            return [null, message];
        })
            .spread((messageBuilder, message) => {
            if (messageBuilder) {
                const toID = R.path(['to', 'id'], message);
                return this.session.sendMessage({ id: toID }, messageBuilder)
                    .then(() => ({ type: 'sent', serviceID: this.serviceId() }));
            }
            return Promise.reject(new Error('Note, Image, Video are only supported.'));
        });
    }
}
exports.Adapter = Adapter;

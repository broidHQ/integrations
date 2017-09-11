"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schemas_1 = require("@broid/schemas");
const utils_1 = require("@broid/utils");
const Promise = require("bluebird");
const express_1 = require("express");
const TelegramBot = require("node-telegram-bot-api");
const R = require("ramda");
const request = require("request-promise");
const Rx_1 = require("rxjs/Rx");
const uuid = require("uuid");
const Parser_1 = require("./Parser");
const WebHookServer_1 = require("./WebHookServer");
const sortByFileSize = R.compose(R.reverse, R.sortBy(R.prop('file_size')));
const markdown = (str) => str.replace(/[\*_\[`]/g, '\\$&');
class Adapter {
    constructor(obj) {
        this.serviceID = obj && obj.serviceID || uuid.v4();
        this.logLevel = obj && obj.logLevel || 'info';
        this.token = obj && obj.token || null;
        if (this.token === '') {
            throw new Error('Token should exist.');
        }
        this.webhookURL = obj.webhookURL.replace(/\/?$/, '/');
        this.parser = new Parser_1.Parser(this.serviceName(), this.serviceID, this.logLevel);
        this.logger = new utils_1.Logger('adapter', this.logLevel);
        this.router = this.setupRouter();
        if (obj.http) {
            this.webhookServer = new WebHookServer_1.WebHookServer(obj.http, this.router, this.logLevel);
        }
    }
    users() {
        return Promise.reject(new Error('Not supported'));
    }
    channels() {
        return Promise.reject(new Error('Not supported'));
    }
    serviceId() {
        return this.serviceID;
    }
    serviceName() {
        return 'telegram';
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
        if (!this.token || !this.webhookURL) {
            return Rx_1.Observable.throw(new Error('Credentials should exist.'));
        }
        if (this.webhookServer) {
            this.webhookServer.listen();
        }
        this.session = new TelegramBot(this.token);
        this.session.setWebHook(`${this.webhookURL}${this.serviceId()}`);
        this.connected = true;
        return Rx_1.Observable.of({ type: 'connected', serviceID: this.serviceId() });
    }
    disconnect() {
        this.connected = true;
        if (this.webhookServer) {
            return this.webhookServer.close();
        }
        return Promise.resolve(null);
    }
    listen() {
        if (!this.session) {
            return Rx_1.Observable.throw(new Error('No session found.'));
        }
        return Rx_1.Observable.merge(Rx_1.Observable.fromEvent(this.session, 'callback_query')
            .map(R.assoc('_event', 'callback_query')), Rx_1.Observable.fromEvent(this.session, 'inline_query')
            .map(R.assoc('_event', 'inline_query')), Rx_1.Observable.fromEvent(this.session, 'chosen_inline_result')
            .map(R.assoc('_event', 'chosen_inline_result')), Rx_1.Observable.fromEvent(this.session, 'message')
            .map(R.assoc('_event', 'message')))
            .switchMap((value) => {
            return Rx_1.Observable.of(value)
                .mergeMap((event) => this.parser.normalize(event))
                .mergeMap((data) => {
                const normalized = data;
                if (data.text) {
                    normalized.type = 'Note';
                    return Promise.resolve(normalized);
                }
                else if (data.photo || data.video) {
                    let file = data.photo;
                    if (R.is(Array, data.photo)) {
                        normalized.type = 'Image';
                        normalized.photo = sortByFileSize(data.photo);
                        file = normalized.photo[0];
                    }
                    if (data.video) {
                        file = data.video;
                        if (R.is(Array, data.video)) {
                            normalized.type = 'Video';
                            normalized.video = sortByFileSize(data.video);
                            file = normalized.video[0];
                        }
                    }
                    const fileID = R.path(['file_id'], file);
                    return this.session.getFileLink(fileID)
                        .then((link) => {
                        normalized.text = link;
                        return normalized;
                    });
                }
                this.logger.warning(new Error('This event is not supported.'));
                return Promise.resolve(null);
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
            const options = { parse_mode: 'Markdown' };
            const objectType = R.path(['object', 'type'], data);
            const toID = R.path(['to', 'id'], data)
                || R.path(['to', 'name'], data);
            const confirm = () => ({ type: 'sent', serviceID: this.serviceId() });
            if (objectType === 'Image' || objectType === 'Video') {
                const url = R.path(['object', 'url'], data);
                if (url.startsWith('http://') || url.startsWith('https://')) {
                    const stream = request(url);
                    if (objectType === 'Image') {
                        return this.session.sendPhoto(toID, stream)
                            .then(confirm);
                    }
                    return this.session.sendVideo(toID, stream)
                        .then(confirm);
                }
                return Promise.reject(new Error('File path should be URI'));
            }
            else if (objectType === 'Note') {
                const attachmentButtons = R.filter((attachment) => attachment.type === 'Button', R.path(['object', 'attachment'], data) || []);
                let buttons = R.map((button) => {
                    if (R.contains(button.mediaType, ['text/html'])) {
                        return [{ text: button.name, url: button.url }];
                    }
                    return [{ text: button.name, callback_data: button.url }];
                }, attachmentButtons);
                buttons = R.reject(R.isNil)(buttons);
                if (!R.isEmpty(buttons)) {
                    options.reply_markup = options.reply_markup || { inline_keyboard: [] };
                    options.reply_markup.inline_keyboard = options.reply_markup.inline_keyboard || [];
                    options.reply_markup.inline_keyboard = R.concat(options.reply_markup.inline_keyboard, buttons);
                }
                const content = R.path(['object', 'content'], data);
                if (content && content !== '') {
                    return this.session.sendMessage(toID, markdown(content), options)
                        .then(confirm);
                }
            }
            return Promise.reject(new Error('Only Note, Image, and Video are supported.'));
        });
    }
    setupRouter() {
        const router = express_1.Router();
        const handle = (req, res) => {
            this.session.processUpdate(req.body);
            res.sendStatus(200);
        };
        router.post(`/${this.serviceId()}`, handle);
        router.get(`/${this.serviceId()}`, handle);
        return router;
    }
}
exports.Adapter = Adapter;

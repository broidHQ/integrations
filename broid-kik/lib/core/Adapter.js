"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schemas_1 = require("@broid/schemas");
const utils_1 = require("@broid/utils");
const KikBot = require("@kikinteractive/kik");
const Promise = require("bluebird");
const express_1 = require("express");
const uuid = require("node-uuid");
const R = require("ramda");
const Rx_1 = require("rxjs/Rx");
const url = require("url");
const Parser_1 = require("./Parser");
const WebHookServer_1 = require("./WebHookServer");
class Adapter {
    constructor(obj) {
        this.serviceID = obj && obj.serviceID || uuid.v4();
        this.logLevel = obj && obj.logLevel || 'info';
        this.token = obj && obj.token || null;
        this.username = obj && obj.username || 'SMS';
        this.storeUsers = new Map();
        if (this.token === '') {
            throw new Error('Token should exist.');
        }
        this.webhookURL = obj.webhookURL.replace(/\/?$/, '/');
        this.parser = new Parser_1.Parser(this.serviceName(), this.serviceID, this.logLevel);
        this.logger = new utils_1.Logger('adapter', this.logLevel);
        this.router = express_1.Router();
        if (obj.http) {
            this.webhookServer = new WebHookServer_1.WebHookServer(obj.http, this.router, this.logLevel);
        }
    }
    users() {
        return Promise.resolve(this.storeUsers);
    }
    channels() {
        return Promise.reject(new Error('Not supported'));
    }
    serviceName() {
        return 'kik';
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
        if (!this.token || !this.username || !this.webhookURL) {
            return Rx_1.Observable.throw(new Error('Credentials should exist.'));
        }
        const webhookURL = url.parse(this.webhookURL);
        const kikOptions = {
            apiKey: this.token,
            baseUrl: `${webhookURL.protocol}//${webhookURL.hostname}`,
            username: this.username,
            incomingPath: "/",
        };
        if (webhookURL.path) {
            kikOptions.incomingPath = webhookURL.path.replace(/\/?$/, '');
        }
        this.session = new KikBot(kikOptions);
        this.router.use('/', this.session.incoming());
        if (this.webhookServer) {
            this.webhookServer.listen();
        }
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
        this.session.updateBotConfiguration();
        return Rx_1.Observable.create((observer) => {
            this.session.use((incoming, next) => {
                this.user(incoming.from, true)
                    .then((userInformation) => this.parser.normalize(incoming, userInformation))
                    .then((normalized) => this.parser.parse(normalized))
                    .then((parsed) => this.parser.validate(parsed))
                    .then((validated) => {
                    if (validated) {
                        observer.next(validated);
                    }
                    return next();
                });
            });
        });
    }
    send(data) {
        this.logger.debug('sending', { message: data });
        return schemas_1.default(data, 'send')
            .then(() => {
            const toID = R.path(['to', 'id'], data) ||
                R.path(['to', 'name'], data);
            const dataType = R.path(['object', 'type'], data);
            const attachments = R.path(['object', 'attachment'], data);
            let buttons = R.filter((attachment) => attachment.type === 'Button', attachments || []);
            buttons = R.map((button) => button.url || button.name, buttons);
            buttons = R.reject(R.isNil)(buttons);
            return Promise.resolve(buttons)
                .then((btns) => {
                if (dataType === 'Image' || dataType === 'Video') {
                    const url = R.path(['object', 'url'], data);
                    const name = R.path(['object', 'name'], data) || '';
                    const preview = R.path(['object', 'preview'], data) || url;
                    let message;
                    if (dataType === 'Image') {
                        message = KikBot.Message.picture(url);
                    }
                    if (dataType === 'Video') {
                        message = KikBot.Message.video(url);
                    }
                    if (message && name) {
                        message.setAttributionName(name);
                    }
                    if (message && preview) {
                        message.setAttributionIcon(preview);
                    }
                    return [btns, message];
                }
                else if (dataType === 'Note') {
                    return [btns, KikBot.Message.text(R.path(['object', 'content'], data))];
                }
                return [null, null];
            })
                .spread((btns, content) => {
                if (content) {
                    if (btns && !R.isEmpty(btns)) {
                        content.addResponseKeyboard(btns, false, toID);
                    }
                    return this.session.send(content, toID)
                        .then(() => ({ type: 'sent', serviceID: this.serviceId() }));
                }
                throw new Error('Only Note, Image, and Video are supported.');
            });
        });
    }
    user(key, cache = true) {
        if (!this.session) {
            return Promise.reject(new Error('Session should be initilized before.'));
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
exports.Adapter = Adapter;

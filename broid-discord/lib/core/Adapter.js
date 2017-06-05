"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schemas_1 = require("@broid/schemas");
const utils_1 = require("@broid/utils");
const Promise = require("bluebird");
const Discordie = require("discordie");
const uuid = require("node-uuid");
const R = require("ramda");
const request = require("request-promise");
const Rx_1 = require("rxjs/Rx");
const Events = Discordie.Events;
const Parser_1 = require("./Parser");
class Adapter {
    constructor(obj) {
        this.serviceID = obj && obj.serviceID || uuid.v4();
        this.logLevel = obj && obj.logLevel || 'info';
        this.token = obj && obj.token || null;
        this.session = new Discordie({
            autoReconnect: true,
        });
        this.parser = new Parser_1.Parser(this.serviceName(), this.serviceID, this.logLevel);
        this.logger = new utils_1.Logger('adapter', this.logLevel);
    }
    users() {
        return new Promise((resolve) => {
            const users = this.session.Users.map((u) => {
                return {
                    avatar: u.avatar,
                    id: u.id,
                    is_bot: u.bot,
                    username: u.username,
                };
            });
            resolve(users);
        });
    }
    channels() {
        return new Promise((resolve) => {
            const channels = this.session.Channels.map((c) => {
                if (c.type !== 0) {
                    return null;
                }
                return {
                    guildID: c.guild_id,
                    id: c.id,
                    name: c.name,
                    topic: c.topic,
                };
            });
            resolve(R.reject(R.isNil)(channels));
        });
    }
    serviceId() {
        return this.serviceID;
    }
    serviceName() {
        return 'discord';
    }
    connect() {
        if (!this.token) {
            return Rx_1.Observable.throw(new Error('Token should exist.'));
        }
        if (this.connected) {
            return Rx_1.Observable.of({ type: 'connected', serviceID: this.serviceId() });
        }
        this.connected = true;
        this.session.connect({ token: this.token });
        const connected = Rx_1.Observable
            .fromEvent(this.session.Dispatcher, Events.GATEWAY_READY)
            .map(() => ({ type: 'connected', serviceID: this.serviceId() }));
        const disconnected = Rx_1.Observable
            .fromEvent(this.session.Dispatcher, Events.DISCONNECTED)
            .map(() => ({ type: 'disconnected', serviceID: this.serviceId() }));
        return Rx_1.Observable.merge(connected, disconnected);
    }
    disconnect() {
        this.connected = false;
        this.session.disconnect();
        return Promise.resolve(null);
    }
    listen() {
        return Rx_1.Observable.merge(Rx_1.Observable.fromEvent(this.session.Dispatcher, Events.MESSAGE_CREATE), Rx_1.Observable.fromEvent(this.session.Dispatcher, Events.MESSAGE_UPDATE))
            .mergeMap((e) => {
            if (R.path(['User', 'id'], this.session)
                && R.path(['message', 'author', 'id'], e) === this.session.User.id) {
                return Promise.resolve(null);
            }
            let msg = null;
            if (e.messageId) {
                msg = this.session.Messages.get(e.messageId);
            }
            else if (e.data) {
                msg = e.data;
            }
            else if (e.message) {
                msg = e.message.toJSON();
            }
            if (!msg) {
                return Promise.resolve(null);
            }
            msg.guild = msg.guild ? msg.guild.toJSON() : null;
            return Promise.resolve(msg)
                .then((m) => {
                let channel = this.session.Channels.get(m.channel_id);
                if (!channel) {
                    channel = this.session.DirectMessageChannels.get(m.channel_id);
                    channel = channel.toJSON();
                    channel.isPrivate = true;
                }
                else {
                    channel = channel.toJSON();
                }
                m.channel = channel;
                return m;
            })
                .then((m) => {
                const author = this.session.Users.get(m.author.id);
                m.author = author.toJSON();
                return m;
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
        this.logger.debug('sending', { message: data });
        const updateMessage = (message) => {
            if (!R.isEmpty(message.content)) {
                return this.session.Messages.editMessage(message.content, message);
            }
            return this.session.Messages.deleteMessage(message);
        };
        return schemas_1.default(data, 'send')
            .then(() => {
            const targetType = R.path(['to', 'type'], data);
            const targetID = R.path(['to', 'id'], data);
            let channel = this.session.Channels.get(targetID);
            if (targetType === 'Person') {
                channel = this.session.DirectMessageChannels.get(targetID);
            }
            if (!channel) {
                throw new Error('Channel not found.');
            }
            return channel;
        })
            .then((channel) => {
            const content = R.path(['object', 'content'], data);
            const objectType = R.path(['object', 'type'], data);
            if (objectType === 'Note') {
                const messageID = R.path(['object', 'id'], data);
                if (messageID) {
                    return updateMessage({ id: messageID, channel_id: channel.id, content });
                }
                return channel.sendMessage(content);
            }
            else if (objectType === 'Image' || objectType === 'Video') {
                const url = R.path(['object', 'url'], data);
                const name = R.path(['object', 'name'], data);
                if (url.startsWith('http://') || url.startsWith('https://')) {
                    const stream = request(url);
                    return channel.uploadFile(stream, name || content);
                }
            }
            throw new Error('Image, Video and Note are only supported.');
        })
            .then((r) => {
            const d = { type: 'sent', serviceID: this.serviceId() };
            if (r && r.id) {
                d.id = r.id;
            }
            return d;
        });
    }
}
exports.Adapter = Adapter;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schemas_1 = require("@broid/schemas");
const utils_1 = require("@broid/utils");
const client_1 = require("@slack/client");
const Promise = require("bluebird");
const events_1 = require("events");
const express_1 = require("express");
const uuid = require("node-uuid");
const R = require("ramda");
const rp = require("request-promise");
const Rx_1 = require("rxjs/Rx");
const helpers_1 = require("./helpers");
const Parser_1 = require("./Parser");
const WebHookServer_1 = require("./WebHookServer");
class Adapter {
    constructor(obj) {
        this.serviceID = obj && obj.serviceID || uuid.v4();
        this.logLevel = obj && obj.logLevel || 'info';
        this.token = obj && obj.token || null;
        this.asUser = obj && obj.asUser || true;
        this.storeUsers = new Map();
        this.storeChannels = new Map();
        this.parser = new Parser_1.Parser(this.serviceName(), this.serviceID, this.logLevel);
        this.logger = new utils_1.Logger('adapter', this.logLevel);
        this.emitter = new events_1.EventEmitter();
        this.router = this.setupRoutes();
        if (obj.http) {
            this.webhookServer = new WebHookServer_1.WebHookServer(obj.http, this.router, this.logLevel);
        }
    }
    users() {
        return Promise.resolve(this.storeUsers);
    }
    channels() {
        return Promise.resolve(this.storeChannels);
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
    serviceName() {
        return 'slack';
    }
    connect() {
        if (this.connected) {
            return Rx_1.Observable.of({ type: 'connected', serviceID: this.serviceId() });
        }
        if (!this.token) {
            return Rx_1.Observable.throw(new Error('Credential should exist.'));
        }
        this.connected = true;
        if (this.webhookServer) {
            this.webhookServer.listen();
        }
        this.session = new client_1.RtmClient(this.token, { autoReconnect: true });
        this.sessionWeb = new client_1.WebClient(this.token);
        this.session.start();
        const connected = Rx_1.Observable
            .fromEvent(this.session, client_1.CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED)
            .map(() => Promise.resolve({ type: 'connected', serviceID: this.serviceId() }));
        const authenticated = Rx_1.Observable
            .fromEvent(this.session, client_1.CLIENT_EVENTS.RTM.AUTHENTICATED)
            .map((e) => {
            R.forEach((user) => this.storeUsers.set(user.id, user), e.users || []);
            R.forEach((channel) => this.storeChannels.set(channel.id, channel), e.channels || []);
            return Promise.resolve({ type: 'authenticated', serviceID: this.serviceId() });
        });
        const disconnected = Rx_1.Observable
            .fromEvent(this.session, client_1.CLIENT_EVENTS.RTM.DISCONNECT)
            .map(() => Promise.resolve({ type: 'connected', serviceID: this.serviceId() }));
        const rateLimited = Rx_1.Observable
            .fromEvent(this.session, client_1.CLIENT_EVENTS.WEB.RATE_LIMITED)
            .map(() => Promise.resolve({ type: 'rate_limited', serviceID: this.serviceId() }));
        return Rx_1.Observable.merge(connected, authenticated, disconnected, rateLimited)
            .mergeAll();
    }
    disconnect() {
        this.connected = false;
        if (this.webhookServer) {
            return this.webhookServer.close();
        }
        return Promise.resolve(null);
    }
    listen() {
        const rtmEvents = R.pick(['MESSAGE'], client_1.RTM_EVENTS);
        const events = R.map((key) => Rx_1.Observable.fromEvent(this.session, rtmEvents[key]), R.keys(rtmEvents));
        const webHookEvent = Rx_1.Observable.fromEvent(this.emitter, 'message')
            .mergeMap(helpers_1.parseWebHookEvent);
        events.push(webHookEvent);
        return Rx_1.Observable.merge(...events)
            .mergeMap((event) => {
            if (!R.contains(event.type, [
                'message',
                'event_callback',
                'slash_command',
                'interactive_message',
            ])) {
                return Promise.resolve(null);
            }
            if (event.type === 'message' &&
                R.contains(event.subtype, ['channel_join', 'message_changed'])) {
                return Promise.resolve(null);
            }
            return Promise.resolve(event)
                .then((evt) => {
                if (evt.user) {
                    return this.user(evt.user)
                        .then((userInfo) => {
                        if (userInfo) {
                            evt.user = userInfo;
                        }
                        return evt;
                    });
                }
                return evt;
            })
                .then((evt) => {
                if (evt.channel) {
                    return this.channel(evt.channel)
                        .then((channelInfo) => {
                        if (channelInfo) {
                            evt.channel = channelInfo;
                        }
                        return evt;
                    });
                }
                return evt;
            })
                .then((evt) => {
                if (evt.subtype === 'bot_message') {
                    evt.user = { id: evt.bot_id, is_bot: true, name: evt.username };
                }
                return evt;
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
        return schemas_1.default(data, 'send')
            .then(() => data)
            .then((message) => {
            const buttons = R.filter((attachment) => attachment.type === 'Button', R.path(['object', 'attachment'], data) || []);
            const actions = helpers_1.createActions(buttons);
            const images = R.filter((attachment) => attachment.type === 'Image', R.path(['object', 'attachment'], data) || []);
            const attachments = R.map((image) => ({ image_url: image.url, text: image.content || '', title: image.name }), images);
            return [message, actions, attachments];
        })
            .spread((message, actions, attachments) => {
            const context = R.path(['object', 'context'], message);
            if (context) {
                const contextArr = R.split('#', context.content);
                contextArr.shift();
                let responseURL = contextArr[0];
                if (R.length(contextArr) > 1) {
                    responseURL = R.join('', contextArr);
                }
                return [message, actions, attachments, responseURL];
            }
            return [message, actions, attachments, null];
        })
            .spread((message, actions, attachments, responseURL) => helpers_1.createSendMessage(data, message, actions, attachments, responseURL))
            .then((msg) => {
            const opts = {
                as_user: this.asUser,
                attachments: msg.attachments || [],
                unfurl_links: true,
            };
            const confirm = () => {
                if (msg.callbackID) {
                    return { callbackID: msg.callbackID, serviceID: this.serviceId(), type: 'sent' };
                }
                return { serviceID: this.serviceId(), type: 'sent' };
            };
            if (msg.responseURL) {
                const options = {
                    body: { attachments: opts.attachments, channel: msg.targetID, text: msg.content },
                    json: true,
                    method: 'POST',
                    uri: msg.responseURL,
                };
                return rp(options).then(confirm);
            }
            else if (msg.content === '' && msg.contentID) {
                return Promise.fromCallback((cb) => this.sessionWeb.chat.delete(msg.contentID, msg.targetID, cb))
                    .then(confirm);
            }
            else if (msg.contentID) {
                return Promise.fromCallback((cb) => this.sessionWeb.chat.update(msg.contentID, msg.targetID, msg.content, opts, cb))
                    .then(confirm);
            }
            else if (!R.isEmpty(msg.content)) {
                return Promise.fromCallback((cb) => this.sessionWeb.chat.postMessage(msg.targetID, msg.content, opts, cb))
                    .then(confirm);
            }
            return Promise.reject(new Error('Only Note, Image, and Video are supported.'));
        });
    }
    channel(key, cache = true) {
        if (cache && this.storeChannels.get(key)) {
            const data = this.storeChannels.get(key);
            return Promise.resolve(data);
        }
        const channel = this.session.dataStore.getChannelById(key);
        const group = this.session.dataStore.getGroupById(key);
        const dm = this.session.dataStore.getDMById(key);
        if (channel) {
            this.storeChannels.set(key, R.assoc('_is_channel', true, channel.toJSON()));
        }
        else if (group) {
            this.storeChannels.set(key, R.assoc('_is_group', true, group.toJSON()));
        }
        else if (dm) {
            this.storeChannels.set(key, R.assoc('_is_dm', true, dm.toJSON()));
        }
        if (this.storeChannels.get(key)) {
            return Promise.resolve(this.storeChannels.get(key));
        }
        const pchannel = Promise.fromCallback((done) => this.sessionWeb.channels.info(key, done))
            .catch((error) => error === 'channel_not_found' ? null : { error });
        const pgroup = Promise.fromCallback((done) => this.sessionWeb.groups.info(key, done))
            .catch((error) => error === 'channel_not_found' ? null : { error });
        return Promise.join(pchannel, pgroup, (chan, grp) => {
            if (!chan.error) {
                return R.assoc('_is_channel', true, chan.channel);
            }
            else if (!grp.error) {
                return R.assoc('_is_group', true, grp.group);
            }
            else if (!chan.error && !grp.error) {
                return {
                    _is_dm: true,
                    id: key,
                };
            }
            throw chan.error || grp.error;
        })
            .then((info) => {
            this.storeChannels.set(key, info);
            return info;
        });
    }
    user(key, cache = true) {
        if (cache && this.storeUsers.get(key)) {
            const data = this.storeUsers.get(key);
            return Promise.resolve(data);
        }
        if (this.session.dataStore.getUserById(key)) {
            const u = this.session.dataStore.getUserById(key);
            this.storeUsers.set(key, u.toJSON());
            return Promise.resolve(this.storeUsers.get(key));
        }
        return new Promise((resolve, reject) => this.sessionWeb.users.info(key, (error, info) => {
            if (error || !info.ok) {
                return reject(error);
            }
            this.storeUsers.set(key, info.user);
            return resolve(info.user);
        }));
    }
    setupRoutes() {
        const router = express_1.Router();
        router.post('/', (req, res) => {
            const event = {
                request: req,
                response: res,
            };
            this.emitter.emit('message', event);
            res.send('');
        });
        return router;
    }
}
exports.Adapter = Adapter;

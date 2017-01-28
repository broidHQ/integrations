"use strict";
const Promise = require("bluebird");
const broid_schemas_1 = require("broid-schemas");
const broid_utils_1 = require("broid-utils");
const fs = require("fs");
const uuid = require("node-uuid");
const R = require("ramda");
const rp = require("request-promise");
const Rx_1 = require("rxjs/Rx");
const Twit = require("twit");
const parser_1 = require("./parser");
class Adapter {
    constructor(obj) {
        this.serviceID = obj && obj.serviceID || uuid.v4();
        this.logLevel = obj && obj.logLevel || "info";
        this.token = obj && obj.token || null;
        this.tokenSecret = obj && obj.tokenSecret || null;
        this.consumerKey = obj && obj.consumerKey || null;
        this.consumerSecret = obj && obj.consumerSecret || null;
        this.username = obj && obj.username || null;
        this.myid = this.token && this.token.split("-")[0];
        if (this.username && !this.username.startsWith("@")) {
            this.username = `@${this.username}`;
        }
        this.parser = new parser_1.default(this.serviceID, this.logLevel);
        this.logger = new broid_utils_1.Logger("adapter", this.logLevel);
        this.storeUsers = new Map();
    }
    users() {
        return Promise.resolve(R.map((user) => user, this.storeUsers.values()));
    }
    channels() {
        return Promise.reject(new Error("Not supported"));
    }
    serviceId() {
        return this.serviceID;
    }
    connect() {
        if (!this.token
            || !this.tokenSecret
            || !this.consumerKey
            || !this.consumerSecret) {
            return Rx_1.Observable.throw(new Error("Credentials should exist."));
        }
        this.session = new Twit({
            access_token: this.token,
            access_token_secret: this.tokenSecret,
            consumer_key: this.consumerKey,
            consumer_secret: this.consumerSecret,
        });
        this.sessionGET = Promise.promisify(this.session.get.bind(this.session));
        this.sessionPOST = Promise.promisify(this.session.post.bind(this.session));
        return Rx_1.Observable.of({ type: "connected", serviceID: this.serviceId() });
    }
    disconnect() {
        return Promise.reject(new Error("Not supported"));
    }
    listen() {
        const streamMention = this.session.stream("statuses/filter", { track: this.username });
        const streamDm = this.session.stream("user");
        return Rx_1.Observable.merge(Rx_1.Observable.fromEvent(streamDm, "direct_message"), Rx_1.Observable.fromEvent(streamMention, "tweet"))
            .mergeMap((event) => {
            this.logger.debug("Event received", event);
            if (event.direct_message) {
                event = event.direct_message;
            }
            const authorInformation = event.user || event.sender;
            this.storeUsers.set(authorInformation.id_str, authorInformation);
            if (authorInformation.id_str === this.myid) {
                return Promise.resolve(null);
            }
            event._username = this.username;
            if (event.in_reply_to_user_id) {
                return this.userById(event.in_reply_to_user_id, true)
                    .then((data) => {
                    event.recipient = R.assoc("is_mention", true, data);
                    return event;
                });
            }
            return Promise.resolve(event);
        })
            .mergeMap((event) => this.parser.normalize(event))
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
            const name = R.path(["object", "name"], data);
            const content = R.path(["object", "content"], data);
            const type = R.path(["object", "type"], data);
            const toID = R.path(["to", "id"], data);
            const options = {
                content,
                screen_name: "",
                to_channel: !(R.path(["to", "type"], data) === "Person"),
                twit_options: { retry: true },
                user_id: null,
            };
            let job = Promise.resolve(null);
            if (!toID.startsWith("@") && !isNaN(Number(toID.charAt(0)))) {
                options.user_id = toID;
                if (options.to_channel) {
                    job = this.userById(toID, true)
                        .then((user) => {
                        options.screen_name = `@${user.screen_name}`;
                        return options;
                    });
                }
                else {
                    job = Promise.resolve(options);
                }
            }
            else {
                options.screen_name = toID;
                job = Promise.resolve(options);
            }
            return job.then((opts) => {
                if (!opts) {
                    throw new Error("Only Note, Image, and Video are supported.");
                }
                if (type === "Image" || type === "Video") {
                    if (opts.to_channel) {
                        return [
                            opts,
                            this.createMedia(R.path(["object", "url"], data), name),
                        ];
                    }
                    opts.content = `${opts.content} ${R.path(["object", "url"], data)}`;
                }
                return [opts, null];
            })
                .spread((opts, mediaID) => {
                let path = "statuses/update";
                const params = {
                    twit_options: opts.twit_options,
                };
                if (!opts.to_channel) {
                    path = "direct_messages/new";
                    params.text = opts.content;
                    if (opts.screen_name) {
                        params.screen_name = opts.screen_name;
                    }
                    else {
                        params.user_id = opts.user_id;
                    }
                }
                else {
                    params.status = `${opts.screen_name}: ${opts.content}`;
                }
                if (mediaID) {
                    params.media_ids = R.values(mediaID);
                }
                return this.sessionPOST(path, params)
                    .then(() => ({ type: "sended", serviceID: this.serviceId() }));
            });
        });
    }
    userById(key, cache = true) {
        if (cache && this.storeUsers.get(key)) {
            const data = this.storeUsers.get(key);
            return Promise.resolve(data);
        }
        return this.sessionGET("users/show", { user_id: key })
            .then((data) => {
            this.storeUsers.set(key, data);
            return data;
        });
    }
    createMedia(url, altText = "") {
        let stream = Promise.resolve(null);
        if (url.startsWith("http://") || url.startsWith("https://")) {
            stream = rp(url, { encoding: null })
                .then((body) => new Buffer(body).toString("base64"));
        }
        else {
            stream = Promise.resolve(fs.readFileSync(url, { encoding: "base64" }));
        }
        return stream
            .then((b64) => {
            if (b64) {
                return b64;
            }
            throw new Error("URL should a absolute path or http url.");
        })
            .then((b64) => this.sessionPOST("media/upload", { media_data: b64 }))
            .then((data) => {
            const mediaID = data.media_id_string;
            return this.sessionPOST("media/metadata/create", { media_id: mediaID, altText: { text: altText } })
                .then(() => ({ mediaID }));
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Adapter;

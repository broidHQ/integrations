"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise = require("bluebird");
<<<<<<< HEAD
const broid_schemas_1 = require("broid-schemas");
const broid_utils_1 = require("broid-utils");
const crypto = require("crypto");
const events_1 = require("events");
const express_1 = require("express");
=======
const schemas_1 = require("@broid/schemas");
const utils_1 = require("@broid/utils");
>>>>>>> devel
const fs = require("fs-extra");
const uuid = require("node-uuid");
const path = require("path");
const R = require("ramda");
const request = require("request");
const Rx_1 = require("rxjs/Rx");
const tmp = require("tmp");
const WeChat = require("wechat-api");
const parser_1 = require("./parser");
const webHookServer_1 = require("./webHookServer");
class Adapter {
    constructor(obj) {
        this.serviceID = obj && obj.serviceID || uuid.v4();
        this.logLevel = obj && obj.logLevel || "info";
        this.appID = obj && obj.appID;
        this.appSecret = obj && obj.appSecret;
<<<<<<< HEAD
        this.emitter = new events_1.EventEmitter();
        this.logger = new broid_utils_1.Logger("adapter", this.logLevel);
=======
        this.HTTPOptions = obj.http || HTTPOptions;
        this.logger = new utils_1.Logger("adapter", this.logLevel);
>>>>>>> devel
        if (!this.appID) {
            throw new Error("appID must be set");
        }
        if (!this.appSecret) {
            throw new Error("appSecret must be set");
        }
        this.client = Promise.promisifyAll(new WeChat(this.appID, this.appSecret));
        this.parser = new parser_1.default(this.serviceName(), this.client, this.serviceID, this.logLevel);
        this.router = this.setupRouter();
        if (obj.http) {
            this.webhookServer = new webHookServer_1.default(obj.http, this.router, this.logLevel);
        }
    }
    serviceId() {
        return this.serviceID;
    }
    serviceName() {
        return "wechat";
    }
    connect() {
        if (this.connected) {
            return Rx_1.Observable.of({ type: "connected", serviceID: this.serviceId() });
        }
        if (this.webhookServer) {
            this.webhookServer.listen();
        }
        this.connected = true;
        return Rx_1.Observable.of(({ type: "connected", serviceID: this.serviceId() }));
    }
    disconnect() {
        this.connected = false;
        if (this.webhookServer) {
            return this.webhookServer.close();
        }
        return Promise.resolve(null);
    }
    listen() {
        if (!this.webhookServer) {
            return Rx_1.Observable.throw(new Error("No webhookServer found."));
        }
        return Rx_1.Observable.fromEvent(this.emitter, "message")
            .mergeMap((event) => this.parser.parse(event))
            .mergeMap((parsed) => this.parser.validate(parsed))
            .mergeMap((validated) => {
            if (!validated) {
                return Rx_1.Observable.empty();
            }
            return Promise.resolve(validated);
        });
    }
    users() {
        return this.client.getFollowersAsync()
            .then((res) => this.client.batchGetUsersAsync(res.data.openid))
            .then(R.prop("user_info_list"));
    }
    getRouter() {
        if (this.webhookServer) {
            return null;
        }
        return this.router;
    }
    send(data) {
        this.logger.debug("sending", { message: data });
        return schemas_1.default(data, "send")
            .then(() => {
            switch (data.object.type) {
                case "Note":
                    return this.client.sendTextAsync(data.to.id, data.object.content);
                case "Audio":
                    return this.uploadFile(data.object.url, "voice", data.object.name || "audio.amr")
                        .then((mediaID) => {
                        return this.client.sendVoiceAsync(data.to.id, mediaID);
                    });
                case "Image":
                    return this.uploadFile(data.object.url, "image", data.object.name || "image.jpg")
                        .then((mediaID) => {
                        return this.client.sendImageAsync(data.to.id, mediaID);
                    });
                case "Video":
                    return this.uploadFile(data.object.url, "video", data.object.name || "video.mp4")
                        .then((mediaID) => {
                        return this.client.sendVideoAsync(data.to.id, mediaID);
                    });
                default:
                    throw new Error(`${data.object.type} not supported.`);
            }
        })
            .then(() => ({ type: "sent", serviceID: this.serviceId() }));
    }
    uploadFile(url, type, file) {
        const tmpdir = tmp.dirSync().name;
        const filePath = path.join(tmpdir, file);
        const fileStream = fs.createWriteStream(filePath);
        return new Promise((resolve, reject) => {
            request(url)
                .pipe(fileStream)
                .on("error", (err) => {
                reject(err);
            })
                .on("close", () => {
                fileStream.close();
                resolve();
            });
        })
            .then(() => this.client.uploadMediaAsync(filePath, type))
            .then((res) => {
            fs.removeSync(tmpdir);
            if (res.errcode) {
                throw new Error(res);
            }
            return res.media_id;
        });
    }
    setupRouter() {
        const router = express_1.Router();
        router.get("/", (req, res) => {
            const shasum = crypto.createHash("sha1");
            shasum.update([this.serviceID, req.query.timestamp, req.query.nonce].sort().join(""));
            const signature = shasum.digest("hex");
            if (signature !== req.query.signature) {
                return res.status(500).end();
            }
            res.status(200).send(req.query.echostr);
        });
        router.post("/", (req, res) => {
            this.emitter.emit("message", req.body.xml);
            res.status(200).end();
        });
        return router;
    }
}
exports.default = Adapter;

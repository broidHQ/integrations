"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise = require("bluebird");
const broid_schemas_1 = require("broid-schemas");
const broid_utils_1 = require("broid-utils");
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
const HTTPOptions = {
    host: "127.0.0.1",
    port: 8080,
};
class Adapter {
    constructor(obj) {
        this.serviceID = obj && obj.serviceID || uuid.v4();
        this.logLevel = obj && obj.logLevel || "info";
        this.appID = obj && obj.appID;
        this.appSecret = obj && obj.appSecret;
        this.HTTPOptions = obj.http || HTTPOptions;
        this.logger = new broid_utils_1.Logger("adapter", this.logLevel);
        if (!this.appID) {
            throw new Error("appID must be set");
        }
        if (!this.appSecret) {
            throw new Error("appSecret must be set");
        }
        this.client = Promise.promisifyAll(new WeChat(this.appID, this.appSecret));
        this.parser = new parser_1.default(this.client, this.serviceID, this.logLevel);
    }
    serviceId() {
        return this.serviceID;
    }
    connect() {
        if (this.connected) {
            return Rx_1.Observable.of({ type: "connected", serviceID: this.serviceId() });
        }
        this.webhookServer = new webHookServer_1.default(this.serviceID, this.HTTPOptions, this.logLevel);
        this.webhookServer.listen();
        this.connected = true;
        return Rx_1.Observable.of(({ type: "connected", serviceID: this.serviceId() }));
    }
    disconnect() {
        this.connected = false;
        return this.webhookServer.close();
    }
    listen() {
        if (!this.webhookServer) {
            return Rx_1.Observable.throw(new Error("No webhookServer found."));
        }
        return Rx_1.Observable.fromEvent(this.webhookServer, "message")
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
    send(data) {
        this.logger.debug("sending", { message: data });
        return broid_schemas_1.default(data, "send")
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
}
exports.default = Adapter;

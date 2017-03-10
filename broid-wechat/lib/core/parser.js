"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise = require("bluebird");
const broid_schemas_1 = require("broid-schemas");
const broid_utils_1 = require("broid-utils");
const R = require("ramda");
class Parser {
    constructor(wechatClient, serviceID, logLevel) {
        this.generatorName = "wechat";
        this.serviceID = serviceID;
        this.logger = new broid_utils_1.Logger("parser", logLevel);
        this.userCache = new Map();
        this.wechatClient = wechatClient;
    }
    validate(event) {
        this.logger.debug("Validation process", { event });
        const parsed = broid_utils_1.cleanNulls(event);
        if (!parsed || R.isEmpty(parsed)) {
            return Promise.resolve(null);
        }
        if (!parsed.type) {
            this.logger.debug("Type not found.", { parsed });
            return Promise.resolve(null);
        }
        return broid_schemas_1.default(parsed, "activity")
            .return(parsed)
            .catch((err) => {
            this.logger.error(err);
            return null;
        });
    }
    parse(event) {
        this.logger.debug("Normalized process");
        const normalized = broid_utils_1.cleanNulls(event);
        if (!normalized || R.isEmpty(normalized)) {
            return Promise.resolve(null);
        }
        switch (normalized.msgtype[0]) {
            case "image":
                return this.parseImage(normalized);
            case "text":
                return this.parseText(normalized);
            case "video":
                return this.parseMultiMedia(normalized, "Video", "video/mp4");
            case "voice":
                return this.parseMultiMedia(normalized, "Audio", "audio/amr");
            default:
                return Promise.resolve(null);
        }
    }
    getUserName(openid) {
        if (this.userCache[openid]) {
            return Promise.resolve(this.userCache[openid]);
        }
        return this.wechatClient.getUserAsync(openid)
            .then(({ nickname }) => {
            this.userCache[openid] = nickname;
            return nickname;
        });
    }
    createActivityStream(normalized) {
        return this.getUserName(normalized.fromusername[0])
            .then((nickname) => {
            const message = {
                "@context": "https://www.w3.org/ns/activitystreams",
                "actor": {
                    id: normalized.fromusername[0],
                    name: nickname,
                    type: "Person",
                },
                "generator": {
                    id: this.serviceID,
                    name: this.generatorName,
                    type: "Service",
                },
                "object": {},
                "published": parseInt(normalized.createtime[0], 10),
                "target": {
                    id: normalized.tousername[0],
                    name: normalized.tousername[0],
                    type: "Person",
                },
                "type": "Create",
            };
            return message;
        });
    }
    parseImage(normalized) {
        return this.createActivityStream(normalized)
            .then((message) => {
            message.object = {
                id: normalized.msgid[0],
                mediaType: "image/jpeg",
                type: "Image",
                url: normalized.picurl[0],
            };
            return message;
        });
    }
    parseText(normalized) {
        return this.createActivityStream(normalized)
            .then((message) => {
            message.object = {
                content: normalized.content[0],
                id: normalized.msgid[0],
                type: "Note",
            };
            return message;
        });
    }
    parseMultiMedia(normalized, messageType, mediaType) {
        const getAccessToken = this.wechatClient.getLatestTokenAsync()
            .then(R.prop("accessToken"));
        return Promise.join(getAccessToken, this.createActivityStream(normalized))
            .spread((accessToken, message) => {
            message.object = {
                id: normalized.msgid[0],
                mediaType,
                type: messageType,
                url: `http://file.api.wechat.com/cgi-bin/media/get?access_token=${accessToken}&media_id=${normalized.mediaid[0]}`,
            };
            return message;
        });
    }
}
exports.default = Parser;

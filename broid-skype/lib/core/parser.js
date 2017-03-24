"use strict";
const Promise = require("bluebird");
const schemas_1 = require("@broid/schemas");
const utils_1 = require("@broid/utils");
const mimetype = require("mimetype");
const uuid = require("node-uuid");
const R = require("ramda");
class Parser {
    constructor(serviceID, logLevel) {
        this.serviceID = serviceID;
        this.generatorName = "skype";
        this.logger = new utils_1.Logger("parser", logLevel);
    }
    validate(event) {
        this.logger.debug("Validation process", { event });
        const parsed = utils_1.cleanNulls(event);
        if (!parsed || R.isEmpty(parsed)) {
            return Promise.resolve(null);
        }
        if (!parsed.type) {
            this.logger.debug("Type not found.", { parsed });
            return Promise.resolve(null);
        }
        return schemas_1.default(parsed, "activity")
            .then(() => parsed)
            .catch((err) => {
            this.logger.error(err);
            return null;
        });
    }
    parse(event) {
        this.logger.debug("Parse process", { event });
        const normalized = utils_1.cleanNulls(event);
        if (!normalized || R.isEmpty(normalized)) {
            return Promise.resolve(null);
        }
        const activitystreams = this.createActivityStream(normalized);
        activitystreams.actor = {
            id: R.path(["user", "id"], normalized),
            name: R.path(["user", "name"], normalized),
            type: "Person",
        };
        activitystreams.target = {
            id: R.path(["address", "bot", "name"], normalized),
            name: R.path(["address", "bot", "name"], normalized),
            type: "Person",
        };
        const addressID = R.path(["address", "id"], normalized);
        const addressChannelID = R.path(["address", "channelId"], normalized);
        const addressConversationID = R.path(["address", "conversation", "id"], normalized);
        const addressBotID = R.path(["address", "conversation", "id"], normalized);
        const context = {
            content: `${addressID}#${addressConversationID}#${addressChannelID}#${addressBotID}`,
            name: "address_id",
            type: "Object",
        };
        const attachmentImages = R.filter((attachment) => attachment.contentType.startsWith("image"), normalized.attachments);
        const attachmentVideos = R.filter((attachment) => attachment.contentType.startsWith("video")
            || attachment.contentType === "application/octet-stream", normalized.attachments);
        if (!R.isEmpty(attachmentImages)) {
            activitystreams.object = {
                content: normalized.text,
                context,
                id: addressID || this.createIdentifier(),
                mediaType: mimetype.lookup(attachmentImages[0].name),
                name: attachmentImages[0].name,
                type: "Image",
                url: attachmentImages[0].contentUrl,
            };
        }
        else if (!R.isEmpty(attachmentVideos)) {
            activitystreams.object = {
                content: normalized.text,
                context,
                id: addressID || this.createIdentifier(),
                mediaType: mimetype.lookup(attachmentVideos[0].name),
                name: attachmentVideos[0].name,
                type: "Video",
                url: attachmentVideos[0].contentUrl,
            };
        }
        if (!activitystreams.object && !R.isEmpty(normalized.text)) {
            activitystreams.object = {
                content: normalized.text,
                context,
                id: addressID || this.createIdentifier(),
                type: "Note",
            };
        }
        return Promise.resolve(activitystreams);
    }
    createIdentifier() {
        return uuid.v4();
    }
    createActivityStream(normalized) {
        let timestamp = Math.floor(Date.now() / 1000);
        if (normalized.timestamp) {
            const dateCreatedAt = new Date(normalized.timestamp);
            timestamp = dateCreatedAt.getTime();
        }
        return {
            "@context": "https://www.w3.org/ns/activitystreams",
            "generator": {
                id: this.serviceID,
                name: this.generatorName,
                type: "Service",
            },
            "published": timestamp,
            "type": "Create",
        };
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Parser;

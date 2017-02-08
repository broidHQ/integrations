"use strict";
const Promise = require("bluebird");
const broid_schemas_1 = require("broid-schemas");
const broid_utils_1 = require("broid-utils");
const uuid = require("node-uuid");
const R = require("ramda");
class Parser {
    constructor(serviceID, logLevel) {
        this.serviceID = serviceID;
        this.generatorName = "groupme";
        this.logger = new broid_utils_1.Logger("parser", logLevel);
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
            .then(() => parsed)
            .catch((err) => {
            this.logger.error(err);
            return null;
        });
    }
    parse(event) {
        this.logger.debug("Normalize process", { event });
        const normalized = broid_utils_1.cleanNulls(event);
        if (!normalized || R.isEmpty(normalized)) {
            return Promise.resolve(null);
        }
        const body = normalized.body || {};
        const groups = normalized.group || [];
        const group = groups[0] || {};
        const activitystreams = this.createActivityStream(normalized);
        activitystreams.actor = {
            id: body.sender_id,
            name: body.name,
            type: body.sender_type === "user" ? "Person" : "Application",
        };
        activitystreams.target = {
            id: body.group_id,
            name: group.name,
            type: group.type === "private" ? "Person" : "Group",
        };
        if (body.recipient_id) {
            activitystreams.target = {
                id: body.recipient_id,
                name: body.name || body.recipient_id,
                type: "Person",
            };
        }
        const locations = [];
        const images = [];
        const emojis = [];
        R.forEach((attachment) => {
            if (attachment.type === "image") {
                let mediaType = "image/jpg";
                if (attachment.url) {
                    if (attachment.url.indexOf(".gif.") !== -1) {
                        mediaType = "image/gif";
                    }
                    else if (attachment.url.indexOf(".png.") !== -1) {
                        mediaType = "image/png";
                    }
                }
                images.push({
                    id: this.createIdentifier(),
                    mediaType,
                    type: "Image",
                    url: attachment.url,
                });
            }
            else if (attachment.type === "location") {
                locations.push({
                    id: this.createIdentifier(),
                    latitude: Number(attachment.lat),
                    longitude: Number(attachment.lng),
                    name: attachment.name,
                    type: "Place",
                });
            }
            else if (attachment.type === "emoji") {
                emojis.push({
                    content: attachment.placeholder,
                });
            }
        }, body.attachments);
        const messageID = body.id || this.createIdentifier();
        let content = body.text;
        if (content === "" && R.length(emojis) !== 0) {
            content = emojis[0].content;
        }
        let object = {
            content,
            id: messageID,
            type: "Note",
        };
        if (R.length(locations) !== 0) {
            object = locations[0];
        }
        else if (R.length(images) === 1) {
            object = images[0];
        }
        else if (R.length(images) > 1) {
            object.attachments = images;
        }
        if (object.type !== "Note") {
            object.id = messageID;
            if (content !== "") {
                object.content = content;
            }
        }
        activitystreams.object = object;
        return Promise.resolve(activitystreams);
    }
    createIdentifier() {
        return uuid.v4();
    }
    createActivityStream(normalized) {
        return {
            "@context": "https://www.w3.org/ns/activitystreams",
            "generator": {
                id: this.serviceID,
                name: this.generatorName,
                type: "Service",
            },
            "published": R.path(["body", "reated_at"], normalized) || Math.floor(Date.now() / 1000),
            "type": "Create",
        };
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Parser;

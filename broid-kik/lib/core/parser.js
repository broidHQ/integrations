"use strict";
const Promise = require("bluebird");
const schemas_1 = require("@broid/schemas");
const utils_1 = require("@broid/utils");
const uuid = require("node-uuid");
const R = require("ramda");
class Parser {
    constructor(serviceID, logLevel) {
        this.serviceID = serviceID;
        this.generatorName = "kik";
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
        this.logger.debug("Normalize process", { event });
        const normalized = utils_1.cleanNulls(event);
        if (!normalized || R.isEmpty(normalized)) {
            return Promise.resolve(null);
        }
        const activitystreams = this.createActivityStream(normalized);
        activitystreams.actor = {
            id: normalized.from.id.toString(),
            name: utils_1.concat([normalized.from.firstName, normalized.from.lastName]),
            type: "Person",
        };
        activitystreams.target = {
            id: normalized.chatID.toString(),
            name: normalized.chatID.toString(),
            type: "Person",
        };
        if (normalized.type === "Image" || normalized.type === "Video") {
            let type = "Image";
            if (normalized.type === "Video") {
                type = "Video";
            }
            activitystreams.object = {
                id: normalized.id.toString() || this.createIdentifier(),
                type,
                url: normalized.content,
            };
        }
        if (R.isEmpty(activitystreams.object) && !R.isEmpty(normalized.content)) {
            activitystreams.object = {
                content: normalized.content,
                id: normalized.id.toString() || this.createIdentifier(),
                type: "Note",
            };
        }
        return Promise.resolve(activitystreams);
    }
    normalize(event, userInformation) {
        this.logger.debug("Event received to normalize");
        const data = {
            chatID: event.chatId,
            content: "",
            createdTimestamp: event.timestamp,
            from: userInformation,
            id: event.id,
            type: "",
        };
        if (event.type === "text") {
            data.type = "Note";
            data.content = event.body;
        }
        else if (event.type === "picture") {
            data.type = "Image";
            data.content = event.picUrl;
        }
        else if (event.type === "video") {
            data.type = "Video";
            data.content = event.videoUrl;
        }
        return Promise.resolve(data);
    }
    createIdentifier() {
        return uuid.v4();
    }
    createActivityStream(normalized) {
        return {
            "@context": "https://www.w3.org/ns/activitystreams",
            "actor": {},
            "generator": {
                id: this.serviceID,
                name: this.generatorName,
                type: "Service",
            },
            "object": {},
            "published": normalized.createdTimestamp ?
                Math.floor(normalized.createdTimestamp / 1000)
                : Math.floor(Date.now() / 1000),
            "target": {},
            "type": "Create",
        };
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Parser;

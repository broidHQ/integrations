"use strict";
const Promise = require("bluebird");
const broid_schemas_1 = require("broid-schemas");
const broid_utils_1 = require("broid-utils");
const mimetype = require("mimetype");
const uuid = require("node-uuid");
const R = require("ramda");
const validUrl = require("valid-url");
class Parser {
    constructor(serviceName, serviceID, logLevel) {
        this.serviceID = serviceID;
        this.generatorName = serviceName;
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
        const activitystreams = this.createActivityStream(normalized);
        activitystreams.actor = {
            id: normalized.senderPhoneNumber,
            name: normalized.senderPhoneNumber,
            type: "Person",
        };
        activitystreams.target = {
            id: normalized.toPhoneNumber,
            name: normalized.toPhoneNumber,
            type: "Person",
        };
        if (validUrl.isUri(normalized.text)) {
            const mediaType = mimetype.lookup(normalized.text);
            if (mediaType.startsWith("image/")) {
                activitystreams.object = {
                    id: normalized.eventID || this.createIdentifier(),
                    mediaType,
                    type: "Image",
                    url: normalized.text,
                };
            }
            else if (mediaType.startsWith("video/")) {
                activitystreams.object = {
                    id: normalized.eventID || this.createIdentifier(),
                    mediaType,
                    type: "Video",
                    url: normalized.text,
                };
            }
        }
        if (R.isEmpty(activitystreams.object) && !R.isEmpty(normalized.text)) {
            activitystreams.object = {
                content: normalized.text,
                id: normalized.eventID || this.createIdentifier(),
                type: "Note",
            };
        }
        return Promise.resolve(activitystreams);
    }
    normalize(event) {
        this.logger.debug("Event received to normalize");
        const body = R.path(["request", "body"], event);
        if (!body || R.isEmpty(body)) {
            return Promise.resolve(null);
        }
        const type = body.type;
        if (type !== "sms.mo") {
            return Promise.resolve(null);
        }
        const senderPhoneNumber = R.path(["data", "from"], body);
        const toPhoneNumber = R.path(["data", "to"], body);
        const text = R.path(["data", "text"], body);
        const eventID = R.path(["event_id"], body);
        const eventAt = R.path(["event_at"], body);
        const data = {
            eventID,
            senderPhoneNumber,
            text,
            timestamp: new Date(eventAt).getTime(),
            toPhoneNumber,
            type,
        };
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
            "published": normalized.timestamp || Math.floor(Date.now() / 1000),
            "target": {},
            "type": "Create",
        };
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Parser;

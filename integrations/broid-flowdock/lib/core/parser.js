"use strict";
const Promise = require("bluebird");
const broid_schemas_1 = require("broid-schemas");
const broid_utils_1 = require("broid-utils");
const uuid = require("node-uuid");
const R = require("ramda");
class Parser {
    constructor(serviceID, logLevel) {
        this.serviceID = serviceID;
        this.generatorName = "flowdock";
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
        this.logger.debug("Normalize process", event);
        const normalized = broid_utils_1.cleanNulls(event);
        if (!normalized || R.isEmpty(normalized)) {
            return Promise.resolve(null);
        }
        const activitystreams = this.createActivityStream(normalized);
        activitystreams.actor = {
            id: R.path(["user", "id"], normalized).toString(),
            name: R.path(["user", "name"], normalized),
            type: "Person",
        };
        activitystreams.target = {
            id: R.path(["flow", "id"], normalized).toString(),
            name: R.path(["flow", "name"], normalized),
            type: normalized._isPrivate ? "Person" : "Group",
        };
        let contentID = normalized.id.toString() || this.createIdentifier();
        let content = normalized.content;
        if (R.is(Object, content)) {
            contentID = R.path(["content", "message"], normalized);
            content = R.path(["content", "updated_content"], normalized);
        }
        if (!activitystreams.object && !R.isEmpty(normalized.content)) {
            activitystreams.object = {
                content,
                id: contentID.toString(),
                type: "Note",
            };
            if (normalized.thread && !R.isEmpty(normalized.thread)) {
                activitystreams.object.context = {
                    content: normalized.thread_id.toString(),
                    name: "thread",
                    type: "Object",
                };
            }
            if (normalized.tags && !R.isEmpty(normalized.tags)) {
                activitystreams.object.tag = R.map((tag) => ({
                    id: tag,
                    name: tag,
                    type: "Object",
                }), normalized.tags);
            }
        }
        return Promise.resolve(activitystreams);
    }
    createIdentifier() {
        return uuid.v4();
    }
    createActivityStream(normalized) {
        let type = "Create";
        if (normalized.event === "message-edit") {
            type = "Update";
            if (R.path(["content", "updated_content"], normalized) === "") {
                type = "Delete";
            }
        }
        return {
            "@context": "https://www.w3.org/ns/activitystreams",
            "generator": {
                id: this.serviceID,
                name: this.generatorName,
                type: "Service",
            },
            "published": normalized.created_at ?
                new Date(normalized.created_at).getTime()
                : Math.floor(Date.now() / 1000),
            "type": type,
        };
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Parser;

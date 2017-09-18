"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schemas_1 = require("@broid/schemas");
const utils_1 = require("@broid/utils");
const Promise = require("bluebird");
const R = require("ramda");
const uuid = require("uuid");
class Parser {
    constructor(serviceName, serviceID, logLevel) {
        this.serviceID = serviceID;
        this.generatorName = serviceName;
        this.logger = new utils_1.Logger('parser', logLevel);
    }
    validate(event) {
        this.logger.debug('Validation process', { event });
        const parsed = utils_1.cleanNulls(event);
        if (!parsed || R.isEmpty(parsed)) {
            return Promise.resolve(null);
        }
        if (!parsed.type) {
            this.logger.debug('Type not found.', { parsed });
            return Promise.resolve(null);
        }
        return schemas_1.default(parsed, 'activity')
            .then(() => parsed)
            .catch((err) => {
            this.logger.error(err);
            return null;
        });
    }
    parse(event) {
        this.logger.debug('Parse process', { event });
        const normalized = utils_1.cleanNulls(event);
        if (!normalized || R.isEmpty(normalized)) {
            return Promise.resolve(null);
        }
        const activitystreams = this.createActivityStream(normalized);
        activitystreams.actor = this.createAuthor(normalized.source);
        activitystreams.target = this.createTarget(normalized.source);
        const messageType = R.path(['message', 'type'], normalized);
        if (!messageType) {
            return Promise.reject(new Error('Line message should contain type information.'));
        }
        const id = R.path(['message', 'id'], normalized) || this.createIdentifier();
        const context = {
            content: normalized.replyToken,
            name: 'reply_token',
            type: 'Object',
        };
        if (messageType.toLowerCase() === 'image' || messageType.toLowerCase() === 'video') {
            activitystreams.object = {
                context,
                id,
                type: 'Image',
                url: 'https://buffer_not_supported.broid.ai',
            };
        }
        else if (messageType.toLowerCase() === 'location') {
            activitystreams.object = {
                content: R.path(['message', 'address'], normalized),
                context,
                id,
                latitude: R.path(['message', 'latitude'], normalized),
                longitude: R.path(['message', 'longitude'], normalized),
                type: 'Place',
            };
        }
        if (!activitystreams.object
            && R.path(['message', 'text'], normalized)
            && !R.isEmpty(R.path(['message', 'text'], normalized))) {
            activitystreams.object = {
                content: R.path(['message', 'text'], normalized),
                context,
                id,
                type: 'Note',
            };
        }
        return Promise.resolve(activitystreams);
    }
    normalize(event) {
        this.logger.debug('Event received to normalize');
        if (event.type === 'postback') {
            event.message = {
                text: R.path(['postback', 'data'], event),
                type: 'postback',
            };
        }
        return Promise.resolve(event);
    }
    createIdentifier() {
        return uuid.v4();
    }
    createActivityStream(normalized) {
        return {
            '@context': 'https://www.w3.org/ns/activitystreams',
            'generator': {
                id: this.serviceID,
                name: this.generatorName,
                type: 'Service',
            },
            'published': normalized.timestamp ?
                Math.floor(normalized.timestamp / 1000)
                : Math.floor(Date.now() / 1000),
            'type': 'Create',
        };
    }
    createAuthor(source) {
        if (source.userId) {
            return {
                id: source.userId,
                name: source.displayName || source.userId,
                type: 'Person',
            };
        }
        return {
            id: 'broid_ghost',
            name: 'Broid Ghost',
            type: 'Person',
        };
    }
    createTarget(source) {
        if (source.userId) {
            return {
                id: source.userId,
                name: source.displayName || source.userId,
                type: 'Person',
            };
        }
        else if (source.type === 'group') {
            return {
                id: source.groupId,
                name: source.groupId,
                type: 'Group',
            };
        }
        else if (source.type === 'room') {
            return {
                id: source.roomId,
                name: source.roomId,
                type: 'Group',
            };
        }
        return {};
    }
}
exports.Parser = Parser;

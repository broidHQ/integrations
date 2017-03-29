"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schemas_1 = require("@broid/schemas");
const utils_1 = require("@broid/utils");
const Promise = require("bluebird");
const mimetype = require("mimetype");
const uuid = require("node-uuid");
const R = require("ramda");
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
        activitystreams.actor = {
            id: R.path(['authorInformation', 'id'], normalized),
            name: utils_1.concat([R.path(['authorInformation', 'first_name'], normalized),
                R.path(['authorInformation', 'last_name'], normalized)]),
            type: 'Person',
        };
        activitystreams.target = {
            id: normalized.channel,
            name: normalized.channel,
            type: 'Person',
        };
        let attachments = [];
        if (normalized.attachments) {
            attachments = R.map((attachment) => this.parseAttachment(attachment), normalized.attachments);
            attachments = R.reject(R.isNil)(attachments);
        }
        const places = R.filter((attachment) => attachment.type === 'Place', attachments);
        if (R.length(places) === 1) {
            activitystreams.object = places[0];
            activitystreams.object.id = normalized.mid;
        }
        else if (R.length(attachments) === 1) {
            const attachment = attachments[0];
            activitystreams.object = {
                id: normalized.mid || this.createIdentifier(),
                type: attachment.type,
                url: attachment.url,
            };
            if (attachment.mediaType) {
                activitystreams.object.mediaType = attachment.mediaType;
            }
        }
        else if (R.length(attachments) > 1) {
            activitystreams.object = {
                attachment: attachments,
                content: normalized.content || '',
                id: normalized.mid || this.createIdentifier(),
                type: 'Note',
            };
        }
        if (!activitystreams.object && !R.isEmpty(normalized.content)) {
            activitystreams.object = {
                content: normalized.content,
                id: normalized.mid || this.createIdentifier(),
                type: 'Note',
            };
        }
        return Promise.resolve(activitystreams);
    }
    normalize(event) {
        this.logger.debug('Event received to normalize');
        const req = event.request;
        const body = req.body;
        if (!body || R.isEmpty(body)) {
            return Promise.resolve(null);
        }
        const messages = R.map((entry) => R.map((data) => {
            if (data.message || data.postback) {
                if (data.postback) {
                    return {
                        attachments: [],
                        author: data.sender.id,
                        authorInformation: {},
                        channel: data.sender.id,
                        content: data.postback.payload || null,
                        createdTimestamp: data.timestamp,
                        mid: data.timestamp.toString(),
                        quickReply: [],
                        seq: data.timestamp.toString(),
                    };
                }
                else {
                    return {
                        attachments: data.message.attachments || [],
                        author: data.sender.id,
                        authorInformation: {},
                        channel: data.sender.id,
                        content: data.message.text || null,
                        createdTimestamp: data.timestamp,
                        mid: data.message.mid,
                        quickReply: data.message.quick_reply || [],
                        seq: data.message.seq,
                    };
                }
            }
            return null;
        }, entry.messaging), body.entry);
        return Promise.resolve(R.reject(R.isNil)(R.flatten(messages)));
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
            'published': normalized.createdTimestamp ?
                Math.floor(normalized.createdTimestamp / 1000)
                : Math.floor(Date.now() / 1000),
            'type': 'Create',
        };
    }
    parseAttachment(attachment) {
        if (attachment.type.toLowerCase() === 'image' || attachment.type.toLowerCase() === 'video') {
            const a = {
                type: utils_1.capitalizeFirstLetter(attachment.type.toLowerCase()),
                url: R.path(['payload', 'url'], attachment),
            };
            if (a.url) {
                a.mediaType = mimetype.lookup(a.url.split('?')[0]);
                return a;
            }
        }
        else if (attachment.type.toLowerCase() === 'location') {
            return {
                id: this.createIdentifier(),
                latitude: R.path(['payload', 'coordinates', 'lat'], attachment),
                longitude: R.path(['payload', 'coordinates', 'long'], attachment),
                name: attachment.title,
                type: 'Place',
            };
        }
        return null;
    }
}
exports.Parser = Parser;

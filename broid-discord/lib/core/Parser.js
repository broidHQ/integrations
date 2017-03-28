"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schemas_1 = require("@broid/schemas");
const utils_1 = require("@broid/utils");
const Promise = require("bluebird");
const mimetype = require("mimetype");
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
        this.logger.debug('Normalized process');
        const normalized = utils_1.cleanNulls(event);
        if (!normalized || R.isEmpty(normalized)) {
            return Promise.resolve(null);
        }
        const activitystreams = this.createActivityStream(normalized);
        activitystreams.actor = {
            id: R.path(['author', 'id'], normalized),
            name: R.path(['author', 'username'], normalized),
            type: R.path(['author', 'bot'], normalized) ? 'Application' : 'Person',
        };
        let targetType = 'Group';
        if (R.path(['channel', 'isPrivate'], normalized)) {
            targetType = 'Person';
        }
        let targetName = R.path(['channel', 'name'], normalized);
        if (R.isEmpty(targetName)) {
            targetName = R.path(['channel', 'id'], normalized);
        }
        activitystreams.target = {
            id: R.path(['channel', 'id'], normalized),
            name: targetName,
            type: targetType,
        };
        if (R.length(normalized.attachments) === 1) {
            const m = this.parseMedia(normalized.attachments[0], normalized.content);
            if (m) {
                activitystreams.object = m;
            }
        }
        else if (R.length(normalized.attachments) > 1) {
            let attachments = R.map((mediaURL) => {
                const m = this.parseMedia(mediaURL, null);
                if (m) {
                    return m;
                }
                return null;
            }, normalized.attachments);
            attachments = R.reject(R.isNil)(attachments);
            if (!R.isEmpty(attachments) && !R.isEmpty(normalized.content)) {
                activitystreams.object = {
                    attachment: attachments,
                    content: normalized.content,
                    id: normalized.id,
                    type: 'Note',
                };
            }
        }
        if (!activitystreams.object && !R.isEmpty(normalized.content)) {
            activitystreams.object = {
                content: normalized.content,
                id: normalized.id,
                type: 'Note',
            };
        }
        return Promise.resolve(activitystreams);
    }
    parseMedia(media, content) {
        let mediaType = null;
        const mimeType = mimetype.lookup(media.filename);
        if (mimeType.startsWith('image')) {
            mediaType = 'Image';
        }
        if (mimeType.startsWith('video')) {
            mediaType = 'Video';
        }
        if (mediaType && content) {
            return {
                content,
                id: media.id,
                mediaType: mimeType,
                name: media.filename,
                type: mediaType,
                url: media.url,
            };
        }
        else if (mediaType) {
            return {
                id: media.id,
                mediaType: mimeType,
                name: media.filename,
                type: mediaType,
                url: media.url,
            };
        }
        return null;
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
                Math.floor(new Date(normalized.timestamp).getTime() / 1000)
                : Math.floor(Date.now() / 1000),
            'type': 'Create',
        };
    }
}
exports.Parser = Parser;

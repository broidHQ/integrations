"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schemas_1 = require("@broid/schemas");
const utils_1 = require("@broid/utils");
const Promise = require("bluebird");
const uuid = require("node-uuid");
const R = require("ramda");
class Parser {
    constructor(serviceName, username, serviceID, logLevel) {
        this.serviceID = serviceID;
        this.generatorName = serviceName;
        this.username = username;
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
            .return(parsed)
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
        const activitystreams = {
            '@context': 'https://www.w3.org/ns/activitystreams',
            'actor': {
                id: normalized.from,
                name: normalized.from,
                type: 'Person',
            },
            'generator': {
                id: this.serviceID,
                name: this.generatorName,
                type: 'Service',
            },
            'object': {
                content: normalized.message,
                id: uuid.v4(),
                type: 'Note',
            },
            'published': Math.floor(Date.now() / 1000),
            'target': {
                id: normalized.to,
                name: normalized.to,
                type: normalized.to === this.username ? 'Person' : 'Group',
            },
            'type': 'Create',
        };
        return Promise.resolve(activitystreams);
    }
}
exports.Parser = Parser;

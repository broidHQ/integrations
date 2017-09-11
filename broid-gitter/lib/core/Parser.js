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
        this.logger.debug('Normalize process', { event });
        const normalized = utils_1.cleanNulls(event);
        if (!normalized || R.isEmpty(normalized)) {
            return Promise.resolve(null);
        }
        const activitystreams = this.createActivityStream(normalized);
        activitystreams.actor = {
            id: R.path(['data', 'fromUser', 'id'], normalized),
            name: R.path(['data', 'fromUser', 'username'], normalized),
            type: 'Person',
        };
        activitystreams.target = {
            id: R.path(['room', 'id'], normalized),
            name: R.path(['room', 'name'], normalized),
            type: R.path(['room', 'oneToOne'], normalized) ? 'Person' : 'Group',
        };
        activitystreams.object = {
            content: R.path(['data', 'text'], normalized),
            id: R.path(['data', 'id'], normalized) || this.createIdentifier(),
            type: 'Note',
        };
        return Promise.resolve(activitystreams);
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
            'published': R.path(['data', 'sent'], normalized) ?
                Math.floor(new Date(R.path(['data', 'sent'], normalized)).getTime() / 1000) :
                Math.floor(Date.now() / 1000),
            'type': 'Create',
        };
    }
}
exports.Parser = Parser;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schemas_1 = require("@broid/schemas");
const utils_1 = require("@broid/utils");
const Promise = require("bluebird");
const moment = require("moment");
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
        this.logger.debug('Normalize process', { event });
        const normalized = utils_1.cleanNulls(event);
        if (!normalized || R.isEmpty(normalized)) {
            return Promise.resolve(null);
        }
        const activitystreams = this.createActivityStream(normalized);
        activitystreams.actor = {
            id: normalized.msisdn,
            name: normalized.msisdn,
            type: 'Person',
        };
        activitystreams.target = {
            id: normalized.to,
            name: normalized.to,
            type: 'Person',
        };
        activitystreams.object = {
            content: normalized.text,
            id: normalized.messageId || this.createIdentifier(),
            type: 'Note',
        };
        return Promise.resolve(activitystreams);
    }
    createIdentifier() {
        return uuid.v4();
    }
    createActivityStream(event) {
        let timestamp = moment().unix();
        if (event.timestamp) {
            timestamp = moment.utc(event.timestamp, 'YYYY-MM-DD HH:mm:ss', true)
                .unix();
        }
        return {
            '@context': 'https://www.w3.org/ns/activitystreams',
            'generator': {
                id: this.serviceID,
                name: this.generatorName,
                type: 'Service',
            },
            'published': timestamp,
            'type': 'Create',
        };
    }
}
exports.Parser = Parser;

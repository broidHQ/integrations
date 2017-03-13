"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Ajv = require("ajv");
const Promise = require("bluebird");
function default_1(data, schema) {
    const BASE_URL = "http://schemas.broid.ai/";
    const ajv = new Ajv({
        allErrors: true,
        extendRefs: true,
    });
    const schemas = require("./schemas");
    schemas.forEach((schemaName) => ajv.addSchema(require(`./schemas/${schemaName}`), schemaName));
    if (schema.indexOf("http") < 0) {
        schema = `${BASE_URL}${schema}.json`;
    }
    return new Promise((resolve, reject) => {
        const valid = ajv.validate(schema, data);
        if (!valid) {
            return reject(new Error(ajv.errorsText()));
        }
        return resolve(true);
    });
}
exports.default = default_1;

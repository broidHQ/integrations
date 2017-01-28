import Ajv from "ajv";
import Promise from "bluebird";
const schemas = require("./schemas");

const BASE_URL = "http://schemas.broid.ai/";
const ajv = new Ajv({
  allErrors: true,
  extendRefs: true,
});
schemas.forEach((schema) => ajv.addSchema(require(`./schemas/${schema}`), schema));

export default (data, schema) => {
  if (schema.indexOf("http") < 0) { schema = `${BASE_URL}${schema}.json`; }

  return new Promise((resolve, reject) => {
    const valid = ajv.validate(schema, data);
    if (!valid) return reject(new Error(ajv.errorsText()));
    return resolve(true);
  });
};

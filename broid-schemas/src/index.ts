import * as Ajv from "ajv";
import * as Promise from "bluebird";

export interface IASBase {
  id: string;
  name?: string;
  type: string;
}

export interface IASContext {
  content: string;
  name?: string;
  type: string;
}

export interface IASMedia {
  content?: string;
  context?: IASContext;
  id?: string;
  mediaType?: string;
  name?: string;
  preview?: string;
  type: string;
  url: string;
}

export interface IASObject {
  attachment?: IASMedia | IASMedia[] | null;
  content?: string;
  context?: IASContext;
  id: string;
  latitude?: number;
  longitude?: number;
  mediaType?: string;
  name?: string;
  preview?: string;
  tag?: IASTag | IASTag[];
  type: string;
  url?: string;
}

export interface IActivityStream {
   readonly "@context": string;
   readonly published: number;
   readonly type: string;
   readonly generator: IASBase;
   actor?: IASBase;
   target?: IASBase;
   object?: IASObject;
 }

export interface IASTag {
  id: string;
  name: string;
  type: string;
}

export interface ISendParameters {
  readonly "@context": string;
  readonly type: string;
  readonly generator: {};
  actor?: IASBase;
  to: IASBase;
  object: IASObject;
}

export default function(data: any, schema: string): Promise<any> {
  const BASE_URL = "http://schemas.broid.ai/";
  const ajv: any = new Ajv({
    allErrors: true,
    extendRefs: true,
  });

  const schemas = require("./schemas");
  schemas.forEach((schemaName) =>
    ajv.addSchema(require(`./schemas/${schemaName}`), schemaName));

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

/**
 * @license
 * Copyright 2017 Broid.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 */

import * as Ajv from 'ajv';
import * as Promise from 'bluebird';

export interface IASBase {
  id: string;
  name?: string;
  type: string; // tslint:disable-line:no-reserved-keywords
}

export interface IASContext {
  content: string;
  name?: string;
  type: string; // tslint:disable-line:no-reserved-keywords
}

export interface IASMedia {
  content?: string;
  context?: IASContext;
  id?: string;
  mediaType?: string;
  name?: string;
  preview?: string;
  type: string; // tslint:disable-line:no-reserved-keywords
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
  type: string; // tslint:disable-line:no-reserved-keywords
  url?: string;
}

export interface IActivityStream {
   readonly '@context': string;
   readonly published: number;
   readonly type: string; // tslint:disable-line:no-reserved-keywords
   readonly generator: IASBase;
   actor?: IASBase;
   target?: IASBase;
   object?: IASObject;
 }

export interface IASTag {
  id: string;
  name: string;
  type: string; // tslint:disable-line:no-reserved-keywords
}

export interface ISendParameters {
  readonly '@context': string;
  readonly type: string; // tslint:disable-line:no-reserved-keywords
  readonly generator: {};
  actor?: IASBase;
  to: IASBase;
  object: IASObject;
}

export default function(data: any, schema: string): Promise<any> { // tslint:disable-line:no-default-export
  const BASE_URL = 'http://schemas.broid.ai/';
  const ajv: any = new Ajv({
    allErrors: true,
    extendRefs: true,
  });

  const schemas = require('./schemas'); // tslint:disable-line:no-require-imports
  schemas.forEach((schemaName) =>
    ajv.addSchema(require(`./schemas/${schemaName}`), schemaName)); // tslint:disable-line:no-require-imports

  if (schema.indexOf('http') < 0) {
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

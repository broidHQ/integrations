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

import { default as schemas, IActivityStream } from '@broid/schemas';
import { cleanNulls, Logger } from '@broid/utils';

import * as Promise from 'bluebird';
import * as uuid from 'node-uuid';
import * as R from 'ramda';

export class Parser {
  public serviceID: string;
  public generatorName: string;
  private logger: Logger;
  private username: string;

  constructor(username: string, serviceID: string, logLevel: string) {
    this.serviceID = serviceID;
    this.generatorName = 'irc';
    this.username = username;
    this.logger = new Logger('parser', logLevel);
  }

  // Validate parsed data with Broid schema validator
  public validate(event: object | null): Promise<object | null> {
    this.logger.debug('Validation process', { event });

    const parsed = cleanNulls(event);
    if (!parsed || R.isEmpty(parsed)) { return Promise.resolve(null); }

    if (!parsed.type) {
      this.logger.debug('Type not found.', { parsed });
      return Promise.resolve(null);
    }

    return schemas(parsed, 'activity')
      .return(parsed)
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  // Convert normalized data to Broid schema
  public parse(event: object | null): Promise<object | null> {
    this.logger.debug('Normalized process');

    const normalized = cleanNulls(event);
    if (!normalized || R.isEmpty(normalized)) { return Promise.resolve(null); }

    const activitystreams: IActivityStream = {
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

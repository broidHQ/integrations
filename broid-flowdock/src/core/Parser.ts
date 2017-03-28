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
import * as Promise from 'bluebird';
import broidSchemas from '@broid/schemas';
import { cleanNulls, Logger } from '@broid/utils';
import * as uuid from 'node-uuid';
import * as R from 'ramda';

import { IActivityStream } from './interfaces';

export class Parser {
  public serviceID: string;
  public generatorName: string;
  private logger: Logger;

  constructor(serviceID: string, logLevel: string) {
    this.serviceID = serviceID;
    this.generatorName = 'flowdock';
    this.logger = new Logger('parser', logLevel);
  }

  // Validate parsed data with Broid schema validator
  public validate(event: any): Promise<object> {
    this.logger.debug('Validation process', { event });

    const parsed = cleanNulls(event);
    if (!parsed || R.isEmpty(parsed)) { return Promise.resolve(null); }

    if (!parsed.type) {
      this.logger.debug('Type not found.', { parsed });
      return Promise.resolve(null);
    }

    return broidSchemas(parsed, 'activity')
      .then(() => parsed)
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  // Convert normalized data to Broid schema
  public parse(event: any): Promise<any> {
    this.logger.debug('Normalize process', event);

    const normalized = cleanNulls(event);
    if (!normalized || R.isEmpty(normalized)) { return Promise.resolve(null); }

    const activitystreams = this.createActivityStream(normalized);
    activitystreams.actor = {
      id: R.path(['user', 'id'], normalized).toString(),
      name: R.path(['user', 'name'], normalized),
      type: 'Person',
    };

    activitystreams.target = {
      id: R.path(['flow', 'id'], normalized).toString(),
      name: R.path(['flow', 'name'], normalized),
      type: normalized._isPrivate ? 'Person' : 'Group',
    };

    let contentID: string = normalized.id.toString() || this.createIdentifier();
    let content: any = normalized.content;
    if (R.is(Object, content)) {
      contentID = R.path(['content', 'message'], normalized);
      content = R.path(['content', 'updated_content'], normalized);
    }

    if (!activitystreams.object && !R.isEmpty(normalized.content)) {
      activitystreams.object = {
        content,
        id: contentID.toString(),
        type: 'Note',
      };

      if (normalized.thread && !R.isEmpty(normalized.thread)) {
        activitystreams.object.context = {
          content: normalized.thread_id.toString(),
          name: 'thread',
          type: 'Object',
        };
      }

      if (normalized.tags && !R.isEmpty(normalized.tags)) {
        activitystreams.object.tag = R.map((tag) => ({
          id: tag,
          name: tag,
          type: 'Object',
        }), normalized.tags);
      }

    }

    return Promise.resolve(activitystreams);
  }

  private createIdentifier(): string {
    return uuid.v4();
  }

  private createActivityStream(normalized): IActivityStream {
    let type = 'Create';
    if (normalized.event === 'message-edit') {
      type = 'Update';
      if (R.path(['content', 'updated_content'], normalized) === '') {
        type = 'Delete';
      }
    }

    return {
      '@context': 'https://www.w3.org/ns/activitystreams',
      'generator': {
        id: this.serviceID,
        name: this.generatorName,
        type: 'Service',
      },
      'published': normalized.created_at ?
        new Date(normalized.created_at).getTime()
        : Math.floor(Date.now() / 1000),
      'type': type,
    };
  }
}

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

import {
   default as schemas,
   IActivityStream
} from '@broid/schemas';
import { cleanNulls, Logger } from '@broid/utils';

import * as Promise from 'bluebird';
import * as mimetype from 'mimetype';
import * as uuid from 'node-uuid';
import * as R from 'ramda';
import * as validUrl from 'valid-url';

import { ICallrWebHookEvent } from './interfaces';

export class Parser {
  public serviceID: string;
  public generatorName: string;
  private logger: Logger;

  constructor(serviceID: string, logLevel: string) {
    this.serviceID = serviceID;
    this.generatorName = 'callr';
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

    return schemas(parsed, 'activity')
      .then(() => parsed)
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  // Convert normalized data to Broid schema
  public parse(event: any): Promise<IActivityStream> {
    this.logger.debug('Normalize process', { event });

    const normalized = cleanNulls(event);
    if (!normalized || R.isEmpty(normalized)) { return Promise.resolve(null); }

    const activitystreams = this.createActivityStream(normalized);
    activitystreams.actor = {
      id: normalized.senderPhoneNumber,
      name: normalized.senderPhoneNumber,
      type: 'Person',
    };

    activitystreams.target = {
      id: normalized.toPhoneNumber,
      name: normalized.toPhoneNumber,
      type: 'Person',
    };

    // Process potentially media.
    if (validUrl.isUri(normalized.text)) {
      const mediaType = mimetype.lookup(normalized.text);
      if (mediaType.startsWith('image/')) {
        activitystreams.object = {
          id: normalized.eventID || this.createIdentifier(),
          mediaType,
          type: 'Image',
          url: normalized.text,
        };
      } else if (mediaType.startsWith('video/')) {
        activitystreams.object = {
          id: normalized.eventID || this.createIdentifier(),
          mediaType,
          type: 'Video',
          url: normalized.text,
        };
      }
    }

    if (R.isEmpty(activitystreams.object) && !R.isEmpty(normalized.text)) {
      activitystreams.object = {
        content: normalized.text,
        id: normalized.eventID || this.createIdentifier(),
        type: 'Note',
      };
    }

    return Promise.resolve(activitystreams);
  }

  // Normalize the raw event
  public normalize(event: ICallrWebHookEvent): Promise<any> {
    this.logger.debug('Event received to normalize');

    const body: any = R.path(['request', 'body'], event);

    if (!body || R.isEmpty(body)) { return Promise.resolve(null); }

    const bodyType: string = body.type;
    if (bodyType !== 'sms.mo') { return Promise.resolve(null); }

    const senderPhoneNumber = R.path(['data', 'from'], body);
    const toPhoneNumber = R.path(['data', 'to'], body);
    const text = R.path(['data', 'text'], body);
    const eventID = R.path(['event_id'], body);
    const eventAt = R.path(['event_at'], body);

    const data = {
      eventID,
      senderPhoneNumber,
      text,
      timestamp: new Date(eventAt).getTime(),
      toPhoneNumber,
      type: bodyType,
    };

    return Promise.resolve(data);
  }

  private createIdentifier(): string {
    return uuid.v4();
  }

  private createActivityStream(normalized: any): IActivityStream {
    return {
      '@context': 'https://www.w3.org/ns/activitystreams',
      'actor': {},
      'generator': {
        id: this.serviceID,
        name: this.generatorName,
        type: 'Service',
      },
      'object': {},
      'published': normalized.timestamp || Math.floor(Date.now() / 1000),
      'target': {},
      'type': 'Create',
    };
  }
}

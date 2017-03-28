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
import * as mimetype from 'mimetype';
import * as uuid from 'node-uuid';
import * as R from 'ramda';

import { IActivityStream } from './interfaces';

export default class Parser {
  public serviceID: string;
  public generatorName: string;
  private logger: Logger;

  constructor(serviceID: string, logLevel: string) {
    this.serviceID = serviceID;
    this.generatorName = 'viber';
    this.logger = new Logger('parser', logLevel);
  }

  // Validate parsed data with Broid schema validator
  public validate(event: any): Promise<any> {
    this.logger.debug('Validation process', { event });

    const parsed = cleanNulls(event);
    if (!parsed || R.isEmpty(parsed)) { return Promise.resolve(null); }

    if (!parsed.type) {
      this.logger.debug('Type not found.', { parsed });
      return Promise.resolve(null);
    }

    return broidSchemas(parsed, 'activity')
      .then(() => parsed)
      .catch((err: any) => {
        this.logger.error(err);
        return null;
      });
  }

  // Convert normalized data to Broid schema
  public parse(event: any): Promise<IActivityStream | null> {
    this.logger.debug('Normalize process', { event });

    const normalized = cleanNulls(event);
    if (!normalized || R.isEmpty(normalized)) { return Promise.resolve(null); }

    const activitystreams = this.createActivityStream(normalized);
    activitystreams.actor = {
      id: R.path(['author', 'id'], normalized),
      name: R.path(['author', 'name'], normalized),
      type: 'Person',
    };

    // Note: we ignore the target data if the message is send to the public page
    if (R.path(['target', '_isMe'], normalized)) {
      activitystreams.target = activitystreams.actor;
    } else {
      activitystreams.target = {
        id: R.path(['target', 'name'], normalized),
        name: R.path(['target', 'name'], normalized),
        type: R.path(['target', '_isMe'], normalized) ? 'Application' : 'Person',
      };
    }

    const content = normalized.text;
    const id = normalized.token.toString() || this.createIdentifier();
    // Process potentially media.
    if (normalized.url && normalized.type === 'Image' || normalized.type === 'Video') {
      activitystreams.object = {
        id,
        mediaType: mimetype.lookup(normalized.url.split('?')[0]),
        type: normalized.type,
        url: normalized.url,
      };
    } else if (normalized.type === 'Place') {
      activitystreams.object = {
        id,
        latitude: normalized.latitude,
        longitude: normalized.longitude,
        type: 'Place',
      };
    }

    if (content && !R.isEmpty(content)) {
      if (activitystreams.object && !R.isEmpty(activitystreams.object)) {
        activitystreams.object.content = content;
      } else {
        activitystreams.object = {
          content,
          id,
          type: 'Note',
        };
      }
    }

    return Promise.resolve(activitystreams);
  }

  // Normalize the raw event
  public normalize(evt: any): Promise<any> {
    this.logger.debug('Event received to normalize');

    const event = cleanNulls(evt);
    if (!event || R.isEmpty(event) || R.path(['message', 'stickerId'], evt)) {
      return Promise.resolve(null);
    }

    const author = event.user_profile;
    const latitude = R.path(['message', 'latitude'], event);
    const longitude = R.path(['message', 'longitude'], event);
    const text = R.path(['message', 'text'], event);
    const timestamp = R.path(['message', 'timestamp'], event);
    const token = R.path(['message', 'token'], event);
    const url = R.path(['message', 'url'], event);

    const data: any = {
      author,
      token,
      timestamp,
      type: 'Note',
    };

    if (text) { data.text = text; }

    if (url) {
      const u: string = url as string;
      let type: string = '';
      if (u.indexOf('sig/video') !== -1) { type = 'Video'; }
      if (u.indexOf('sig/image') !== -1) { type = 'Image'; }

      data.type = type;
      data.url = u;
    } else if (latitude && longitude) {
      data.type = 'Place';
      data.latitude = latitude;
      data.longitude = longitude;
    }

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
      'published': normalized.timestamp ?
        Math.floor(normalized.timestamp / 1000)
        : Math.floor(Date.now() / 1000),
      'target': {},
      'type': 'Create',
    };
  }
}

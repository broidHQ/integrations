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
import * as R from 'ramda';

import { IActivityStream } from './interfaces';

export default class Parser {
  public serviceID: string;
  public generatorName: string;
  private logger: Logger;

  constructor(serviceID: string, logLevel: string) {
    this.serviceID = serviceID;
    this.generatorName = 'discord';
    this.logger = new Logger('parser', logLevel);
  }

  // Validate parsed data with Broid schema validator
  public validate(event: any): Promise<Object> {
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
    this.logger.debug('Normalized process');

    const normalized = cleanNulls(event);
    if (!normalized || R.isEmpty(normalized)) { return Promise.resolve(null); }

    const activitystreams = this.createActivityStream(normalized);
    activitystreams.actor = {
      id: R.path(['author', 'id'], normalized),
      name: R.path(['author', 'username'], normalized),
      type: R.path(['author', 'bot'], normalized) ? 'Application' : 'Person',
    };

    let targetType = 'Group';
    if (R.path(['channel', 'isPrivate'], normalized)) {
      targetType = 'Person';
    }

    let targetName =  R.path(['channel', 'name'], normalized);
    if (R.isEmpty(targetName)) {
      targetName = R.path(['channel', 'id'], normalized);
    }

    activitystreams.target = {
      id: R.path(['channel', 'id'], normalized),
      name: targetName,
      type: targetType,
    };

    if (R.length(normalized.attachments) === 1) {
      const m = this.parseMedia(normalized.attachments[0], normalized.content);
      if (m) { activitystreams.object = m; }
    } else if (R.length(normalized.attachments) > 1) {
      let attachments = R.map((mediaURL) => {
        const m = this.parseMedia(mediaURL, null);
        if (m) { return m; }
        return null;
      }, normalized.attachments);

      attachments = R.reject(R.isNil)(attachments);
      if (!R.isEmpty(attachments) && !R.isEmpty(normalized.content)) {
        activitystreams.object = {
          attachment: attachments,
          content: normalized.content,
          id: normalized.id,
          type: 'Note',
        };
      }
    }

    if (!activitystreams.object && !R.isEmpty(normalized.content)) {
      activitystreams.object = {
        content: normalized.content,
        id: normalized.id,
        type: 'Note',
      };
    }

    return Promise.resolve(activitystreams);
  }

  private parseMedia(media: any, content: string | null): Object | null {
    let type: string | null = null;
    const mimeType = mimetype.lookup(media.filename);
    if (mimeType.startsWith('image')) { type = 'Image'; }
    if (mimeType.startsWith('video')) { type = 'Video'; }

    if (type && content) {
      return {
        content,
        id: media.id,
        mediaType: mimeType,
        name: media.filename,
        type,
        url: media.url,
      };
    } else if (type) {
      return {
        id: media.id,
        mediaType: mimeType,
        name: media.filename,
        type,
        url: media.url,
      };
    }

    return null;
  }

  private createActivityStream(normalized): IActivityStream {
    return {
      '@context': 'https://www.w3.org/ns/activitystreams',
      'generator': {
        id: this.serviceID,
        name: this.generatorName,
        type: 'Service',
      },
      'published': normalized.timestamp ?
        Math.floor(new Date(normalized.timestamp).getTime() / 1000)
        : Math.floor(Date.now() / 1000),
      'type': 'Create',
    };
  }
}

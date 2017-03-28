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
import * as validUrl from 'valid-url';

import { IActivityStream, IMediaObject, IMessage } from './interfaces';

export default class Parser {
  public serviceID: string;
  public generatorName: string;
  private logger: Logger;

  constructor(serviceName: string, serviceID: string, logLevel: string) {
    this.serviceID = serviceID;
    this.generatorName = serviceName;
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
  public parse(event: IMessage | null): Promise<Object> {
    this.logger.debug('Parse process', { event });

    const normalized = cleanNulls(event);
    if (!normalized || R.isEmpty(normalized)) { return Promise.resolve(null); }

    const activitystreams = this.createActivityStream(normalized);
    activitystreams.actor = {
      id: R.path(['user', 'id'], normalized),
      name: R.path(['user', 'name'], normalized),
      type: R.path(['user', 'is_bot'], normalized) ? 'Application' : 'Person',
    };

    activitystreams.target = {
      id: R.path(['channel', 'id'], normalized),
      name: R.path(['channel', 'id'], normalized) || R.path(['channel', 'user'], normalized),
      type: R.path(['channel', 'is_im'], normalized) ? 'Person' : 'Group',
    };

    // Process potentially media.
    let url: string = normalized.text.substr(1);
    url = url.substring(0, url.length - 1);
    if (validUrl.isWebUri(url)) {
      const mediaType = mimetype.lookup(url);
      if (mediaType.startsWith('image/')) {
        activitystreams.object = {
          id: normalized.eventID || this.createIdentifier(),
          mediaType,
          type: 'Image',
          url,
        };
      } else if (mediaType.startsWith('video/')) {
        activitystreams.object = {
          id: normalized.eventID || this.createIdentifier(),
          mediaType,
          type: 'Video',
          url,
        };
      }
    }

    if (normalized.file) {
      const attachment = this.parseFile(normalized.file);
      if (attachment) {
        activitystreams.object = {
          content: attachment.content,
          id: normalized.ts || this.createIdentifier(),
          mediaType: attachment.mediaType,
          name: attachment.name,
          type: attachment.type,
          url: attachment.url,
        };

        if (attachment.preview) {
          activitystreams.object.preview = attachment.preview;
        }
      }
    }

    if (!activitystreams.object && !R.isEmpty(normalized.content)) {
      activitystreams.object = {
        content: normalized.text,
        id: normalized.ts || this.createIdentifier(),
        type: 'Note',
      };
    }

    if (activitystreams.object && normalized.subtype === 'interactive_message') {
      activitystreams.object.context = {
        content: `${normalized.callback_id}#${normalized.response_url}`,
        name: 'interactive_message_callback',
        type: 'Object',
      };
    }

    return Promise.resolve(activitystreams);
  }

  private createIdentifier(): string {
    return uuid.v4();
  }

  private createActivityStream(normalized): IActivityStream {
    return {
      '@context': 'https://www.w3.org/ns/activitystreams',
      'generator': {
        id: this.serviceID,
        name: this.generatorName,
        type: 'Service',
      },
      'published': normalized.ts ?
        this.ts2Timestamp(normalized.ts)
        : Math.floor(Date.now() / 1000),
      'type': 'Create',
    };
  }

  private ts2Timestamp(ts: string): number {
    const n: number = Number(ts.split('.')[0]);
    return new Date(n * 1000).getTime() / 1000;
  }

  private parseFile(attachment: any): IMediaObject | null {
    if (attachment.mimetype.startsWith('image')
    || attachment.mimetype.startsWith('video')) {
      let type = 'Image';
      if (attachment.mimetype.startsWith('video')) { type = 'Video'; }
      const a: IMediaObject = {
        mediaType: attachment.mimetype,
        name: attachment.name,
        type,
        url: attachment.permalink_public,
      };

      if (attachment.thumb_1024) {
        a.preview = attachment.thumb_1024;
      }

      if (R.is(Array, attachment.initial_comment)) {
        a.content = attachment.initial_comment[0].comment || '';
      } else {
        a.content = attachment.initial_comment.comment || '';
      }
      return a;
    }
    return null;
  }
}

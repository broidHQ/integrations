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
  IActivityStream,
  IASObject,
} from '@broid/schemas';
import { cleanNulls, Logger } from '@broid/utils';

import * as Promise from 'bluebird';
import * as uuid from 'node-uuid';
import * as R from 'ramda';

import { IAttachment, IGroupParsed, IMessage } from './interfaces';

export class Parser {
  public serviceID: string;
  public generatorName: string;
  private logger: Logger;

  constructor(serviceName: string, serviceID: string, logLevel: string) {
    this.serviceID = serviceID;
    this.generatorName = serviceName;
    this.logger = new Logger('parser', logLevel);
  }

  // Validate parsed data with Broid schema validator
  public validate(event: any): Promise<object | null> {
    this.logger.debug('Validation process', { event });

    const parsed = cleanNulls(event);
    if (!parsed || R.isEmpty(parsed)) { return Promise.resolve(null); }

    return schemas(parsed, 'activity')
      .then(() => parsed)
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  // Convert normalized data to Broid schema
  public parse(event: any): Promise<object | null> {
    this.logger.debug('Normalize process', { event });

    const normalized = cleanNulls(event);
    if (!normalized || R.isEmpty(normalized)) { return Promise.resolve(null); }

    const body: IMessage = normalized.body || {};
    const groups: IGroupParsed[] = normalized.group || [];
    const group: IGroupParsed = groups[0] || {};
    const activitystreams: IActivityStream = this.createActivityStream(normalized);

    activitystreams.actor = {
      id:  body.sender_id,
      name: body.name,
      type: body.sender_type === 'user' ? 'Person' : 'Application',
    };

    activitystreams.target = {
      id:  body.group_id,
      name: group.name,
      type: group.type === 'private' ? 'Person' : 'Group',
    };

    if (body.recipient_id) {
      activitystreams.target = {
        id: body.recipient_id,
        name: body.name || body.recipient_id,
        type: 'Person',
      };
    }

    const locations: IASObject[] = [];
    const images: IASObject[] = [];
    const emojis: any[] = [];

    R.forEach(
      (attachment: IAttachment) => {
        if (attachment.type === 'image') {
          let mediaType = 'image/jpg';
          if (attachment.url) {
            if (attachment.url.indexOf('.gif.') !== -1) {
              mediaType = 'image/gif';
            } else if (attachment.url.indexOf('.png.') !== -1) {
              mediaType = 'image/png';
            }
          }

          images.push({
            id: this.createIdentifier(),
            mediaType,
            type: 'Image',
            url: attachment.url,
          });
        } else if (attachment.type === 'location') {
          locations.push({
            id: this.createIdentifier(),
            latitude: Number(attachment.lat),
            longitude: Number(attachment.lng),
            name: attachment.name,
            type: 'Place',
          });
        } else if (attachment.type === 'emoji') {
          emojis.push({
            content: attachment.placeholder,
          });
        }
      },
      body.attachments);

    const messageID: string = body.id || this.createIdentifier();

    let content: string = body.text;
    if (content === '' && R.length(emojis) !== 0) {
      content = emojis[0].content;
    }

    let object: IASObject = {
      content,
      id: messageID,
      type: 'Note',
    };

    if (R.length(locations) !== 0) {
      object = locations[0];
    } else if (R.length(images) === 1) {
      object = images[0];
    } else if (R.length(images) > 1) {
      object.attachments = images;
    }

    if (object.type !== 'Note') {
      object.id = messageID;
      if (content !== '') {
        object.content = content;
      }
    }

    activitystreams.object = object;
    return Promise.resolve(activitystreams);
  }

  private createIdentifier(): string {
    return uuid.v4();
  }

  private createActivityStream(normalized: any): IActivityStream {
    return {
      '@context': 'https://www.w3.org/ns/activitystreams',
      'generator': {
        id: this.serviceID,
        name: this.generatorName,
        type: 'Service',
      },
      'published': R.path(['body', 'reated_at'], normalized) || Math.floor(Date.now() / 1000),
      'type': 'Create',
    };
  }
}

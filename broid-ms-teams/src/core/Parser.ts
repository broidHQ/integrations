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
  IASContext,
} from '@broid/schemas';
import { cleanNulls, Logger } from '@broid/utils';

import * as Promise from 'bluebird';
import * as mimetype from 'mimetype';
import * as uuid from 'node-uuid';
import * as R from 'ramda';

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
  public validate(event: any): Promise<IActivityStream | null> {
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
  public parse(event: any): Promise<IActivityStream | null> {
    this.logger.debug('Parse process', { event });

    const normalized = cleanNulls(event);
    if (!normalized || R.isEmpty(normalized)) { return Promise.resolve(null); }

    const activitystreams = this.createActivityStream(normalized);
    activitystreams.actor = {
      id: R.path(['user', 'id'], normalized),
      name: R.path(['user', 'name'], normalized),
      type: 'Person',
    };

    activitystreams.target = {
      id: R.path(['address', 'bot', 'name'], normalized),
      name: R.path(['address', 'bot', 'name'], normalized),
      type: 'Person',
    };

    const addressID = R.path(['address', 'id'], normalized);
    const addressChannelID = R.path(['address', 'channelId'], normalized);
    const addressConversationID = R.path(['address', 'conversation', 'id'], normalized);
    const addressBotID = R.path(['address', 'conversation', 'id'], normalized);
    const context: IASContext = {
      content: `${addressID}#${addressConversationID}#${addressChannelID}#${addressBotID}`,
      name: 'address_id',
      type: 'Object',
    };

    // Process potentially media.
    const attachmentImages = R.filter(
      (attachment: any) => attachment.contentType.startsWith('image'),
      normalized.attachments);
    const attachmentVideos = R.filter(
      (attachment: any) => attachment.contentType.startsWith('video') ||
        attachment.contentType === 'application/octet-stream',
      normalized.attachments);

    if (!R.isEmpty(attachmentImages)) {
      activitystreams.object = {
        content: normalized.text,
        context,
        id: addressID || this.createIdentifier(),
        mediaType: mimetype.lookup(attachmentImages[0].name),
        name: attachmentImages[0].name,
        type: 'Image',
        url: attachmentImages[0].contentUrl,
      };
    } else if (!R.isEmpty(attachmentVideos)) {
      activitystreams.object = {
        content: normalized.text,
        context,
        id: addressID || this.createIdentifier(),
        mediaType: mimetype.lookup(attachmentVideos[0].name),
        name: attachmentVideos[0].name,
        type: 'Video',
        url: attachmentVideos[0].contentUrl,
      };
    }

    if (!activitystreams.object && !R.isEmpty(normalized.text)) {
      activitystreams.object = {
        content: normalized.text,
        context,
        id: addressID || this.createIdentifier(),
        type: 'Note',
      };
    }

    return Promise.resolve(activitystreams);
  }

  private createIdentifier(): string {
    return uuid.v4();
  }

  private createActivityStream(normalized: any): IActivityStream {
    let timestamp = Math.floor(Date.now() / 1000);
    if (normalized.timestamp) {
      const dateCreatedAt = new Date(normalized.timestamp);
      timestamp = dateCreatedAt.getTime();
    }

    return {
      '@context': 'https://www.w3.org/ns/activitystreams',
      'generator': {
        id: this.serviceID,
        name: this.generatorName,
        type: 'Service',
      },
      'published': timestamp,
      'type': 'Create',
    };
  }
}

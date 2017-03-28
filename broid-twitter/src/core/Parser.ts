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

export class Parser {
  public serviceID: string;
  public generatorName: string;
  private logger: Logger;

  constructor(serviceID: string, logLevel: string) {
    this.serviceID = serviceID;
    this.generatorName = 'twitter';
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
  public parse(event: any): Promise<IActivityStream> {
    this.logger.debug('Normalize process', { event });

    const normalized = cleanNulls(event);
    if (!normalized || R.isEmpty(normalized)) { return Promise.resolve(null); }

    const activitystreams = this.createActivityStream(normalized);
    activitystreams.actor = {
      id: R.path(['author', 'id'], normalized),
      name: R.path(['author', 'name'], normalized),
      type: 'Person',
    };

    activitystreams.target = {
      id: R.path(['channel', 'id'], normalized),
      name: R.path(['channel', 'name'], normalized),
      type: R.path(['channel', 'is_mention'], normalized) ? 'Group' : 'Person',
    };

    // Process attachment.
    // Twitter doesn't allow to send multiple media in one tweet
    const images = R.filter((attachment) => attachment.type === 'Image',
      normalized.attachments);
    const videos = R.filter((attachment) => attachment.type === 'Video',
      normalized.attachments);

    if (!R.isEmpty(images) || !R.isEmpty(videos)) {
      let attachmentType = 'Image';
      let url = null;

      if (!R.isEmpty(images)) {
        url = R.prop('url', images[0]);
      } else {
        attachmentType = 'Video';
        url = R.prop('url', videos[0]);
      }

      if (url) {
        const mediaType = mimetype.lookup(url);
        activitystreams.object = {
          content: normalized.text,
          id: normalized.id || this.createIdentifier(),
          mediaType,
          type: attachmentType,
          url,
        };
      }
    }

    if (!activitystreams.object && !R.isEmpty(normalized.text)) {
      activitystreams.object = {
        content: normalized.text,
        id: normalized.id || this.createIdentifier(),
        type: 'Note',
      };
    }

    if (activitystreams.object && normalized.hashtags
      && !R.isEmpty(normalized.hashtags)) {
        activitystreams.object.tag = R.map(tag => ({
          id: tag.text,
          name: tag.text,
          type: 'Object',
        }), normalized.hashtags)
    }

    return Promise.resolve(activitystreams);
  }

  // Normalize the raw event
  public normalize(raw: any): Promise {
    this.logger.debug('Event received to normalize', { raw });

    const event = cleanNulls(raw);
    if (!event || R.isEmpty(event)) { return Promise.resolve(null); }

    const extractText = (txt: string, username: string, attachments: object[]) => {
      const regex = new RegExp(`^${username}`, 'ig');
      let text = txt.replace(regex, '');

      if (!R.isEmpty(attachments)) {
        R.forEach((attachment) =>
          text = text.replace(`${attachment._url}`, ''), attachments);
      }

      text = text.replace(/\s\s+/g, ' ');
      return R.trim(text);
    };

    const extractBestVideoURL = (variants: object[]) => {
      // It is assumed that Messenger quality url is expected
      // to be good but the not necessarily best.
      const eligible = R.filter((variant) => !R.isNil(variant.bitrate), variants);
      if (R.isEmpty(eligible)) { return null; }

      const bitrateLimit = 832001;
      const selected = R.reduce((prev, curr) => {
        if (prev) {
          if (prev.bitrate > bitrateLimit
              && curr.bitrate < prev.bitrate) {
            return curr;
          }

          if (curr.bitrate > prev.bitrate
              && curr.bitrate < bitrateLimit) {
            return curr;
          }

          return prev;
        }
        return curr;
      }, null, eligible);

      return selected.url;
    };

    const authorInformation = event.user || event.sender;
    const dateCreatedAt = new Date(event.created_at);
    const attachments: object[] = R.reject(R.isNil)(R.map((media) => {
      if (media.type === 'photo') {
        return { type: 'Image', url: media.media_url_https, _url: media.url };
      } else if (media.type === 'video' || media.type === 'animated_gif') {
        const url = extractBestVideoURL(R.path(['video_info', 'variants'], media));
        if (!url) { return null; }
        return { type: 'Video', url, _url: media.url };
      }
      return null;
    }, R.path(['entities', 'media'], event) || []));

    const data: object = {
      attachments,
      author: {
        id: authorInformation.id_str,
        name: authorInformation.name,
        profile_image_url: authorInformation.profile_image_url_https,
        username: authorInformation.screen_name,
      },
      channel: cleanNulls({
        id: R.path(['recipient', 'id_str'], event),
        is_mention: R.path(['recipient', 'is_mention'], event),
        name: R.path(['recipient', 'name'], event),
        profile_image_url: R.path(['recipient', 'profile_image_url_https'], event),
        username: R.path(['recipient', 'screen_name'], event),
      }),
      hashtags: R.map((hashtag) => {
        return { text: hashtag.text };
      }, R.path(['entities', 'hashtags'], event) || []),
      id: event.id_str,
      text: extractText(event.text, event._username, attachments),
      timestamp: dateCreatedAt.getTime(),
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
      'published': normalized.timestamp ?
        Math.floor(normalized.timestamp / 1000)
        : Math.floor(Date.now() / 1000),
      'target': {},
      'type': 'Create',
    };
  }
}

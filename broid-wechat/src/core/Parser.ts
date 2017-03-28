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
import broidSchemas, { IActivityStream } from '@broid/schemas';
import { cleanNulls, Logger } from '@broid/utils';
import * as R from 'ramda';

export class Parser {
  public generatorName: string;
  public serviceID: string;
  private logger: Logger;
  private userCache: object;
  private wechatClient: any;

  constructor(serviceName: string, wechatClient: any, serviceID: string, logLevel: string) {
    this.generatorName = serviceName;
    this.serviceID = serviceID;
    this.logger = new Logger('parser', logLevel);
    this.userCache = new Map();
    this.wechatClient = wechatClient;
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

    return broidSchemas(parsed, 'activity')
      .return(parsed)
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  // Convert normalized data to Broid schema
  public parse(event: object): Promise<IActivityStream | null> {
    this.logger.debug('Normalized process');

    const normalized = cleanNulls(event);
    if (!normalized || R.isEmpty(normalized)) { return Promise.resolve(null); }

    switch (normalized.msgtype[0]) {
      case 'image':
        return this.parseImage(normalized);
      case 'text':
        return this.parseText(normalized);
      case 'video':
        return this.parseMultiMedia(normalized, 'Video', 'video/mp4');
      case 'voice':
        return this.parseMultiMedia(normalized, 'Audio', 'audio/amr');
      default:
        return Promise.resolve(null);
    }
  }

  private getUserName(openid: string): Promise<string> {
    if (this.userCache[openid]) {
      return Promise.resolve(this.userCache[openid]);
    }

    return this.wechatClient.getUserAsync(openid)
      .then(({nickname}) => {
        this.userCache[openid] = nickname;
        return nickname;
      });
  }

  private createActivityStream(normalized: any): Promise<IActivityStream> {
    return this.getUserName(normalized.fromusername[0])
      .then((nickname: string) => {
        const message: IActivityStream = {
          '@context': 'https://www.w3.org/ns/activitystreams',
          'actor': {
            id: normalized.fromusername[0],
            name: nickname,
            type: 'Person',
          },
          'generator': {
            id: this.serviceID,
            name: this.generatorName,
            type: 'Service',
          },
          'object': {},
          'published': parseInt(normalized.createtime[0], 10),
          'target': {
            id: normalized.tousername[0],
            name: normalized.tousername[0],
            type: 'Person',
          },
          'type': 'Create',
        };

        return message;
      });
  }

  private parseImage(normalized: any): Promise<IActivityStream> {
    return this.createActivityStream(normalized)
      .then((message: IActivityStream) => {
        message.object = {
          id: normalized.msgid[0],
          mediaType: 'image/jpeg',
          type: 'Image',
          url: normalized.picurl[0],
        };
        return message;
      });
  }

  private parseText(normalized: any): Promise<IActivityStream> {
    return this.createActivityStream(normalized)
      .then((message: IActivityStream) => {
        message.object = {
          content: normalized.content[0],
          id: normalized.msgid[0],
          type: 'Note',
        };
        return message;
      });
  }

  private parseMultiMedia(normalized: any, messageType: string, mediaType: string): Promise<IActivityStream> {
    const getAccessToken = this.wechatClient.getLatestTokenAsync()
      .then(R.prop('accessToken'));

    return Promise.join(getAccessToken, this.createActivityStream(normalized))
      .spread((accessToken: string, message: IActivityStream) => {
        message.object = {
          id: normalized.msgid[0],
          mediaType,
          type: messageType,
          url: `http://file.api.wechat.com/cgi-bin/media/get?access_token=${accessToken}&media_id=${normalized.mediaid[0]}`,
        };

        return message;
      });
  }
}

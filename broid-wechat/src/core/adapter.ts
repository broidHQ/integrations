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

import schemas, { ISendParameters } from '@broid/schemas';
import { Logger } from '@broid/utils';

import * as Promise from 'bluebird';
import * as fs from 'fs-extra';
import * as uuid from 'node-uuid';
import * as path from 'path';
import * as R from 'ramda';
import * as request from 'request';
import { Observable } from 'rxjs/Rx';
import * as tmp from 'tmp';
import * as WeChat from 'wechat-api';

import { IAdapterHTTPOptions, IAdapterOptions } from './interfaces';
import { Parser } from './Parser';
import { WebHookServer } from './WebHookServer';

const optionsHTTP: IAdapterHTTPOptions = {
  host: '127.0.0.1',
  port: 8080,
};

export class Adapter {
  public serviceID: string;

  private appID: string;
  private appSecret: string;
  private client: any;
  private connected: boolean;
  private optionsHTTP: IAdapterHTTPOptions;
  private logLevel: string;
  private logger: Logger;
  private parser: Parser;
  private webhookServer: WebHookServer;

  constructor(obj: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || 'info';
    this.appID = obj && obj.appID;
    this.appSecret = obj && obj.appSecret;

    this.optionsHTTP = obj.http || optionsHTTP;

    this.logger = new Logger('adapter', this.logLevel);

    if (!this.appID) {
      throw new Error('appID must be set');
    }
    if (!this.appSecret) {
      throw new Error('appSecret must be set');
    }

    this.client = Promise.promisifyAll(new WeChat(this.appID, this.appSecret));
    this.parser = new Parser(this.client, this.serviceID, this.logLevel);
  }

  // Return the service ID of the current instance
  public serviceId(): string {
    return this.serviceID;
  }

  public connect(): Observable<object> {
    if (this.connected) {
      return Observable.of({ type: 'connected', serviceID: this.serviceId() });
    }

    this.webhookServer = new WebHookServer(this.serviceID, this.optionsHTTP, this.logLevel);
    this.webhookServer.listen();
    this.connected = true;

    return Observable.of(({ type: 'connected', serviceID: this.serviceId() }));
  }

  public disconnect(): Promise<null> {
    this.connected = false;
    return this.webhookServer.close();
  }

  public listen(): Observable<object> {
    if (!this.webhookServer) {
      return Observable.throw(new Error('No webhookServer found.'));
    }

    return Observable.fromEvent(this.webhookServer, 'message')
      .mergeMap((event: object) => this.parser.parse(event))
      .mergeMap((parsed: object | null) => this.parser.validate(parsed))
      .mergeMap((validated: object | null) => {
        if (!validated) { return Observable.empty(); }
        return Promise.resolve(validated);
      });
  }

  public users(): Promise<any | Error> {
    return this.client.getFollowersAsync()
      .then((res) => this.client.batchGetUsersAsync(res.data.openid))
      .then(R.prop('user_info_list'));
  }

  public send(data: ISendParameters): Promise<object | Error> {
    this.logger.debug('sending', { message: data });

    return schemas(data, 'send')
      .then(() => {
        switch (data.object.type) {
          case 'Note':
            return this.client.sendTextAsync(data.to.id, data.object.content);
          case 'Audio':
            return this.uploadFile(data.object.url, 'voice', data.object.name || 'audio.amr')
              .then((mediaID) => {
                return this.client.sendVoiceAsync(data.to.id, mediaID);
              });
          case 'Image':
            return this.uploadFile(data.object.url, 'image', data.object.name || 'image.jpg')
              .then((mediaID) => {
                return this.client.sendImageAsync(data.to.id, mediaID);
              });
          case 'Video':
            return this.uploadFile(data.object.url, 'video', data.object.name || 'video.mp4')
              .then((mediaID) => {
                return this.client.sendVideoAsync(data.to.id, mediaID);
              });
          default:
            throw new Error(`${data.object.type} not supported.`);
        }
      })
      .then(() => ({ type: 'sent', serviceID: this.serviceId() }));
  }

  private uploadFile(url: string, fileType: string, file: string): Promise<string> {
    const tmpdir: string = tmp.dirSync().name;
    const filePath: string = path.join(tmpdir, file);
    const fileStream = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
      request(url)
        .pipe(fileStream)
        .on('error', (err) => {
          reject(err);
        })
        .on('close', () => {
          fileStream.close();
          resolve();
        });
    })
    .then(() => this.client.uploadMediaAsync(filePath, fileType))
    .then((res) => {
      fs.removeSync(tmpdir);
      if (res.errcode) {
        throw new Error(res);
      }
      return res.media_id;
    });
  }
}

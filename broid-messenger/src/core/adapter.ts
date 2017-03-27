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

import schemas from '@broid/schemas';
import { concat, Logger } from '@broid/utils';

import * as Promise from 'bluebird';
import * as uuid from 'node-uuid';
import * as R from 'ramda';
import * as rp from 'request-promise';
import { Observable } from 'rxjs/Rx';

import { createAttachment, createButtons, parseQuickReplies } from './helpers';
import { IAdapterHTTPOptions, IAdapterOptions, IWebHookEvent } from './interfaces';
import { Parser } from './Parser';
import { WebHookServer } from './WebHookServer';

export class Adapter {
  private connected: boolean;
  private optionsHTTP: IAdapterHTTPOptions;
  private logLevel: string;
  private logger: Logger;
  private parser: Parser;
  private serviceID: string;
  private storeUsers: Map<string, object>;
  private token: string | null;
  private tokenSecret: string | null;
  private webhookServer: WebHookServer;

  constructor(obj?: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || 'info';
    this.token = obj && obj.token || null;
    this.tokenSecret = obj && obj.tokenSecret || null;
    this.storeUsers = new Map();

    const optionsHTTP: IAdapterHTTPOptions = {
      host: '127.0.0.1',
      port: 8080,
    };
    this.optionsHTTP = obj && obj.http || optionsHTTP;
    this.optionsHTTP.host = this.optionsHTTP.host || optionsHTTP.host;
    this.optionsHTTP.port = this.optionsHTTP.port || optionsHTTP.port;

    this.parser = new Parser(this.serviceID, this.logLevel);
    this.logger = new Logger('adapter', this.logLevel);
  }

  // Return list of users information
  public users(): Promise<Map<string, object>> {
    return Promise.resolve(this.storeUsers);
  }

  // Return list of channels information
  public channels(): Promise<Error> {
    return Promise.reject(new Error('Not supported'));
  }

  // Return the service ID of the current instance
  public serviceId(): string {
    return this.serviceID;
  }

  // Connect to Messenger
  // Start the webhook server
  public connect(): Observable<object> {
    if (this.connected) {
      return Observable.of({ type: 'connected', serviceID: this.serviceId() });
    }

    if (!this.token
      || !this.tokenSecret) {
      return Observable.throw(new Error('Credentials should exist.'));
    }

    this.connected = true;

    this.webhookServer = new WebHookServer(this.tokenSecret, this.optionsHTTP, this.logLevel);
    this.webhookServer.listen();

    return Observable.of({ type: 'connected', serviceID: this.serviceId() });
  }

  public disconnect(): Promise<Error> {
    return Promise.reject(new Error('Not supported'));
  }

  // Listen 'message' event from Messenger
  public listen(): Observable<object> {
    return Observable.fromEvent(this.webhookServer, 'message')
      .mergeMap((event: IWebHookEvent) => this.parser.normalize(event))
      .mergeMap((messages: any) => Observable.from(messages))
      .mergeMap((message: any) => this.user(message.author)
        .then((author) => R.assoc('authorInformation', author, message)))
      .mergeMap((normalized) => this.parser.parse(normalized))
      .mergeMap((parsed) => this.parser.validate(parsed))
      .mergeMap((validated) => {
        if (!validated) { return Observable.empty(); }
        return Promise.resolve(validated);
      });
  }

  public send(data: object): Promise<object | Error> {
    this.logger.debug('sending', { message: data });

    return schemas(data, 'send')
      .then(() => {
        const toID: string = <string> R.path(['to', 'id'], data) ||
          <string> R.path(['to', 'name'], data);
        const dataType: string = <string> R.path(['object', 'type'], data);
        const content: string = <string> R.path(['object', 'content'], data);
        const name: string = <string> R.path(['object', 'name'], data) || content;
        const attachments: any[] = <any[]> R.path(['object', 'attachment'], data) || [];
        const buttons = R.filter(
          (attachment: any) => attachment.type === 'Button',
          attachments);
        const quickReplies = R.filter(
          (button: any) => button.mediaType === 'application/vnd.geo+json',
          buttons);
        const fButtons = createButtons(buttons);
        const fbQuickReplies = parseQuickReplies(quickReplies);
        const messageData: any = {
          message: { attachment: {}, text: '', },
          recipient: { id: toID },
        };

        // Add Quick Reply
        if (R.length(fbQuickReplies) > 0) {
          messageData.message.quick_replies = fbQuickReplies;
        }

        if (dataType === 'Image' || dataType === 'Video') {
          if (dataType === 'Video' && R.isEmpty(fButtons)) {
            messageData.message.text = concat([
              R.path(['object', 'name'], data) || '',
              R.path(['object', 'content'], data) || '',
              R.path(['object', 'url'], data),
            ]);
          } else {
            messageData.message.attachment = createAttachment(name, content, fButtons,
                                                              R.path(['object', 'url'], data));
          }
        } else if (dataType === 'Note') {
          if (!R.isEmpty(fButtons)) {
            messageData.message.attachment = createAttachment(name, content, fButtons);
          } else {
            messageData.message.text = R.path(['object', 'content'], data);
            delete messageData.message.attachment;
          }
        }

        if (dataType === 'Note' || dataType === 'Image' || dataType === 'Video') {
          return rp({
            json: messageData,
            method: 'POST',
            qs: { access_token: this.token },
            uri: 'https://graph.facebook.com/v2.8/me/messages',
          })
          .then(() => ({ type: 'sent', serviceID: this.serviceId() }));
        }

        return Promise.reject(new Error('Only Note, Image, and Video are supported.'));
      });
  }

  // Return user information
  private user(id: string,
               fields: string = 'first_name,last_name',
               cache: boolean = true): Promise<object> {
    const key: string = `${id}${fields}`;
    if (cache) {
      const data = this.storeUsers.get(key);
      if (data) {
        return Promise.resolve(data);
      }
    }

    return rp({
      json: true,
      method: 'GET',
      qs: { access_token: this.token, fields },
      uri: `https://graph.facebook.com/v2.8/${id}`,
    })
    .then((data: any) => {
      data.id = data.id || id;
      this.storeUsers.set(key, data);
      return data;
    });
  }
}

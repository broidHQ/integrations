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
import { Logger } from '@broid/utils';

import * as Promise from 'bluebird';
import { Router  } from 'express';
import * as uuid from 'node-uuid';
import * as R from 'ramda';
import { Observable } from 'rxjs/Rx';
import { Bot, Events, Message } from 'viber-bot';

import { IAdapterHTTPOptions, IAdapterOptions } from './interfaces';
import { Parser } from './Parser';
import { WebHookServer } from './WebHookServer';

export class Adapter {
  private avatar: string;
  private connected: boolean;
  private optionsHTTP: IAdapterHTTPOptions;
  private logger: Logger;
  private logLevel: string;
  private me: any;
  private parser: Parser;
  private serviceID: string;
  private session: any;
  private storeUsers: Map<string, any>;
  private token: string | null;
  private username: string | null;
  private router: Router;
  private webhookServer: WebHookServer | null;
  private webhookURL: string;

  constructor(obj: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || 'info';
    this.token = obj && obj.token || null;
    this.username = obj && obj.username || null;
    this.avatar = obj && obj.avatar || '';
    this.webhookURL = obj && obj.webhookURL.replace(/\/?$/, '/') || '';

    const optionsHTTP: IAdapterHTTPOptions = {
      host: '127.0.0.1',
      port: 8080,
    };
    this.optionsHTTP = obj && obj.http || optionsHTTP;
    this.optionsHTTP.host = this.optionsHTTP.host || optionsHTTP.host;
    this.optionsHTTP.port = this.optionsHTTP.port || optionsHTTP.port;

    this.storeUsers = new Map();
    this.parser = new Parser(this.serviceName(), this.serviceID, this.logLevel);
    this.logger = new Logger('adapter', this.logLevel);

    this.router = this.setupRouter();
    if (obj.http) {
      this.webhookServer = new WebHookServer(obj.http, this.router, this.logLevel);
    }
  }

  // Return list of users information
  public users(): Promise<Map<string, any>> {
    return Promise.reject(this.storeUsers);
  }

  // Return list of channels information
  public channels(): Promise<Error> {
    return Promise.reject(new Error('Not supported'));
  }

  // Return the name of the Service/Integration
  public serviceName(): string {
    return 'viber';
  }

  // Return the service ID of the current instance
  public serviceId(): string {
    return this.serviceID;
  }

  // Returns the intialized express router
  public getRouter(): Router | null {
    if (this.webhookServer) {
      return null;
    }

    return this.router;
  }

  // Connect to Viber
  // Start the webhook server
  public connect(): Observable<object | Error> {
    if (this.connected) {
      return Observable.of({ type: 'connected', serviceID: this.serviceId() });
    }

    if (!this.token || !this.username) {
      return Observable.throw(new Error('Credentials should exist.'));
    }

    if (!this.webhookURL) {
      return Observable.throw(new Error('webhookURL should exist.'));
    }

    this.connected = true;
    this.session = new Bot({
      authToken: this.token,
      avatar: this.avatar,
      name: this.username,
    });

    if (this.webhookServer) {
      this.webhookServer.listen();
    }

    return Observable.fromPromise(new Promise((resolve, reject) => {
      this.session.setWebhook(this.webhookURL)
        .then(() => resolve(true))
        .catch((e: Error) => {
          this.logger.error(e);
          this.disconnect();
          reject(e);
        });
    })
    .then(() => ({ type: 'connected', serviceID: this.serviceId() })));
  }

  public disconnect(): Promise<null> {
    if (this.webhookServer) {
      return this.webhookServer.close();
    }
    return Promise.resolve(null);
  }

  // Listen 'message' event from Callr
  public listen(): Observable<object> {
    if (!this.session) {
      return Observable.throw(new Error('No session found.'));
    }

    return Observable.fromEvent(
      this.session,
      Events.MESSAGE_RECEIVED,
      (...args) => ({ message: args[0], user_profile: args[1].userProfile }))
      .mergeMap((event: any) => this.parser.normalize(event))
      .mergeMap((normalized: any) => {
        if (!normalized) { return Promise.resolve(null); }

        const id: any = R.path(['author', 'id'], normalized);
        if (id) {
          this.storeUsers.set(<string> id, normalized.author);
        }
        if (this.me) {
          normalized.target = this.me;
          return Promise.resolve(normalized);
        }

        return this.session.getBotProfile()
          .then((profile: any) => {
            this.me = R.assoc('_isMe', true, profile);
            normalized.target = this.me;
            return normalized;
          });
      })
      .mergeMap((normalized) => this.parser.parse(normalized))
      .mergeMap((parsed) => this.parser.validate(parsed))
      .mergeMap((validated) => {
        if (!validated) { return Observable.empty(); }
        return Promise.resolve(validated);
      });
  }

  public send(data: object): Promise<any> {
    this.logger.debug('sending', { message: data });
    return schemas(data, 'send')
      .then(() => {
        if (R.path(['to', 'type'], data) !== 'Person') {
          return Promise.reject(new Error('Message to a Person is only supported.'));
        }
        return data;
      })
      .then((message: any) => {
        const content = R.path(['object', 'content'], message);
        const dataType = R.path(['object', 'type'], message);

        const attachments: any = R.pathOr([], ['object', 'attachment'], message);
        const attachmentsButtons = R.filter(
          (attachment: any) => attachment.type === 'Button',
          attachments);

        let keyboard: any | null = null;
        if (attachmentsButtons && !R.isEmpty(attachmentsButtons)) {
          keyboard = {
            Buttons: R.map(
              (attachment: any) => {
                let actionType: string = 'reply';
                if (attachment.mediaType === 'text/html') {
                  actionType = 'open-url';
                }

                return {
                  ActionBody: attachment.url,
                  ActionType: actionType,
                  BgColor: '#2db9b9',
                  Text: attachment.name || attachment.content,
                };
              },
              attachmentsButtons),
            DefaultHeight: true,
            Type: 'keyboard',
          };
        }

        if (dataType === 'Note') {
          return [new Message.Text(content, keyboard), message];
        } else if (dataType === 'Image' || dataType === 'Video') {
          const url = R.path(['object', 'url'], message);
          const preview = R.path(['object', 'preview'], message);

          if (dataType === 'Image') {
            return [new Message.Picture(url, content, preview, keyboard), message];
          } else {
            return [new Message.Video(url, null, preview, null, keyboard), message];
          }
        } else if (dataType === 'Place') {
          const latitude = R.path(['object', 'latitude'], message);
          const longitude = R.path(['object', 'longitude'], message);
          return [new Message.Location(latitude, longitude, keyboard), message];
        }

        return [null, message];
      })
      .spread((messageBuilder: any, message: any) => {
        if (messageBuilder) {
          const toID = R.path(['to', 'id'], message);
          return this.session.sendMessage({ id: toID }, messageBuilder)
            .then(() => ({ type: 'sent', serviceID: this.serviceId() }));
        }

        return Promise.reject(new Error('Note, Image, Video are only supported.'));
      });
  }

  private setupRouter(): Router {
    const router = Router();
    router.post('/', this.session.middleware());
    return router;
  }
}

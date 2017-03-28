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
import broidSchemas from '@broid/schemas';
import { concat, Logger } from '@broid/utils';
import * as Promise from 'bluebird';
import { EventEmitter } from 'events';
import { Router } from 'express';
import * as uuid from 'node-uuid';
import * as R from 'ramda';
import * as rp from 'request-promise';
import { Observable } from 'rxjs/Rx';

import { IAdapterOptions, IWebHookEvent } from './interfaces';
import { Parser } from './Parser';
import { WebHookServer } from './WebHookServer';

export class Adapter {
  private connected: boolean;
  private emitter: EventEmitter;
  private logLevel: string;
  private logger: Logger;
  private parser: Parser;
  private router: Router;
  private serviceID: string;
  private storeUsers: Map<string, object>;
  private token: string | null;
  private tokenSecret: string | null;
  private webhookServer: WebHookServer;

  constructor(obj: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || 'info';
    this.token = obj && obj.token || null;
    this.tokenSecret = obj && obj.tokenSecret || null;
    this.storeUsers = new Map();

    this.parser = new Parser(this.serviceName(), this.serviceID, this.logLevel);
    this.logger = new Logger('adapter', this.logLevel);
    this.router = this.setupRouter();

    if (obj.http) {
      this.webhookServer = new WebHookServer(obj.http, this.router, this.logLevel);
    }
  }

  // Return list of users information
  public users(): Promise {
    return Promise.resolve(this.storeUsers);
  }

  // Return list of channels information
  public channels(): Promise {
    return Promise.reject(new Error('Not supported'));
  }

  // Return the service ID of the current instance
  public serviceId(): string {
    return this.serviceID;
  }

  public serviceName(): string {
    return 'messenger';
  }

  public getRouter(): Router | null {
    if (this.webhookServer) {
      return null;
    }
    return this.router;
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
    if (this.webhookServer) {
      this.webhookServer.listen();
    }

    return Observable.of({ type: 'connected', serviceID: this.serviceId() });
  }

  public disconnect(): Promise {
    return Promise.reject(new Error('Not supported'));
  }

  // Listen 'message' event from Messenger
  public listen(): Observable<object> {
    return Observable.fromEvent(this.emitter, 'message')
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

  public send(data: object): Promise {
    this.logger.debug('sending', { message: data });
    return broidSchemas(data, 'send')
      .then(() => {
        const toID: string = R.path(['to', 'id'], data)
          || R.path(['to', 'name'], data);
        const type: string = R.path(['object', 'type'], data);
        const content: string = R.path(['object', 'content'], data);
        const name: string = R.path(['object', 'name'], data) || content;

        const attachments = R.path(['object', 'attachment'], data) || [];
        const buttons = R.filter((attachment) =>
          attachment.type === 'Button', attachments);
        const quickReplies = R.filter((button) =>
          button.mediaType === 'application/vnd.geo+json', buttons);

        let fButtons = R.map((button) => {
          // facebook type: postback, element_share
          if (!button.mediaType) {
            return {
              payload: button.url,
              title: button.name,
              type: 'postback',
            };
          } else if (button.mediaType === 'text/html') {
            // facebook type: web_url, account_link
            return {
              title: button.name,
              type: 'web_url',
              url: button.url,
            };
          } else if (button.mediaType === 'audio/telephone-event') {
            // facebook type: phone_number
            return {
              payload: button.url,
              title: button.name,
              type: 'phone_number',
            };
          }

          return null;
        }, buttons);
        fButtons = R.reject(R.isNil)(fButtons);

        let fbQuickReplies = R.map((button) => {
          if (button.mediaType === 'application/vnd.geo+json') {
            // facebook type: location
            return {
              content_type: 'location',
            };
          }

          return null;
        }, quickReplies);
        fbQuickReplies = R.reject(R.isNil)(fbQuickReplies);

        const messageData: any = {
          message: {
            attachment: {},
            text: '',
          },
          recipient: { id: toID },
        };

        // Add Quick Reply
        if (R.length(fbQuickReplies) > 0) {
          messageData.message.quick_replies = fbQuickReplies;
        }

        if (type === 'Image') {
          const attachment: any = {
            payload: {
              elements: [{
                buttons: !R.isEmpty(fButtons) ? fButtons : null,
                image_url: R.path(['object', 'url'], data),
                item_url: '',
                subtitle: content !== name ? content : '',
                title: name || '',
              }],
              template_type: 'generic',
            },
            type: 'template',
          };
          messageData.message.attachment = attachment;
        } else if (type === 'Video') {
          if (!R.isEmpty(fButtons)) {
            const attachment: any = {
              payload: {
                elements: [{
                  buttons: fButtons,
                  image_url: R.path(['object', 'url'], data),
                  item_url: '',
                  subtitle: content !== name ? content : '',
                  title: name || '',
                }],
                template_type: 'generic',
              },
              type: 'template',
            };
            messageData.message.attachment = attachment;
          } else {
            messageData.message.text = concat([
              R.path(['object', 'name'], data) || '',
              R.path(['object', 'content'], data) || '',
              R.path(['object', 'url'], data),
            ]);
          }
        } else if (type === 'Note') {
          if (!R.isEmpty(fButtons)) {
            const attachment: any = {
              payload: {
                elements: [{
                  buttons: fButtons,
                  image_url: '',
                  item_url: '',
                  subtitle: content || '',
                  title: name || '',
                }],
                template_type: 'generic',
              },
              type: 'template',
            };
            messageData.message.attachment = attachment;
          } else {
            messageData.message.text = R.path(['object', 'content'], data);
            delete messageData.message.attachment;
          }
        }

        if (type === 'Note' || type === 'Image' || type === 'Video') {
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
  private user(id: string, fields: string = 'first_name,last_name', cache: boolean = true): Promise {
    const key: string = `${id}${fields}`;
    if (cache && this.storeUsers.get(key)) {
      const data = this.storeUsers.get(key);
      return Promise.resolve(data);
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

  private setupRouter(): Router {
    const router = Router();

    // Endpoint to verify the trust
    router.get('/', (req, res) => {
      if (req.query['hub.mode'] === 'subscribe') {
        if (req.query['hub.verify_token'] === this.tokenSecret) {
          res.send(req.query['hub.challenge']);
        } else {
          res.send('OK');
        }
      }
    });

    // route handler
    router.post('/', (req, res) => {
      const event: IWebHookEvent = {
        request: req,
        response: res,
      };

      this.emitter.emit('message', event);

      // Assume all went well.
      res.sendStatus(200);
    });

    return router;
  }
}

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
import * as botbuilder from 'botbuilder';
import { Router } from 'express';
import * as mimetype from 'mimetype';
import * as uuid from 'node-uuid';
import * as R from 'ramda';
import { Observable } from 'rxjs/Rx';

import { IAdapterOptions } from './interfaces';
import { Parser } from './Parser';
import { WebHookServer } from './WebHookServer';

export class Adapter {
  private connected: boolean;
  private logLevel: string;
  private logger: Logger;
  private parser: Parser;
  private router: Router;
  private serviceID: string;
  private storeUsers: Map<string, object>;
  private storeAddresses: Map<string, object>;
  private token: string | null;
  private tokenSecret: string | null;
  private webhookServer: WebHookServer;
  private session: botbuilder.UniversalBot;
  private sessionConnector: botbuilder.ChatConnector;

  constructor(obj: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || 'info';
    this.router = Router();
    this.token = obj && obj.token || null;
    this.tokenSecret = obj && obj.tokenSecret || null;
    this.storeUsers = new Map();
    this.storeAddresses = new Map();

    this.parser = new Parser(this.serviceName(), this.serviceID, this.logLevel);
    this.logger = new Logger('adapter', this.logLevel);

    if (obj.http) {
      this.webhookServer = new WebHookServer(obj.http, this.router, this.logLevel);
    }
  }

  // Return list of users information
  public users(): Promise<Map<string, object>> {
    return Promise.resolve(this.storeUsers);
  }

  // Return list of channels information
  public channels(): Promise<Error> {
    return Promise.reject(new Error('Not supported'));
  }

  public addresses(id: string): Promise<object | Error>  {
    const data = this.storeAddresses.get(id);
    if (data) {
      return Promise.resolve(data);
    }

    return Promise.reject(new Error(`Address ${id} not found`));
  }

  // Return the service ID of the current instance
  public serviceId(): string {
    return this.serviceID;
  }

  public serviceName(): string {
    return 'ms-teams';
  }

  public getRouter(): Router | null {
    if (this.webhookServer) {
      return null;
    }
    return this.router;
  }

  // Connect to Skype
  // Start the webhook server
  public connect(): Observable<object> {
    if (this.connected) {
      return Observable.of({ type: 'connected', serviceID: this.serviceId() });
    }

    if (!this.token || !this.tokenSecret) {
      return Observable.throw(new Error('Credentials should exist.'));
    }

    this.sessionConnector = new botbuilder.ChatConnector({
      appId: this.token,
      appPassword: this.tokenSecret,
    });

    this.session = new botbuilder.UniversalBot(this.sessionConnector);
    // Router setup happens on connect, however getRouter can still be called before.
    this.router.post('/', this.sessionConnector.listen());
    if (this.webhookServer) {
      this.webhookServer.listen();
    }

    this.connected = true;
    return Observable.of({ type: 'connected', serviceID: this.serviceId() });
  }

  public disconnect(): Promise<null> {
    this.connected = false;
    if (this.webhookServer) {
      return this.webhookServer.close();
    }

    return Promise.resolve(null);
  }

  // Listen 'message' event from Messenger
  public listen(): Observable<object> {
    return Observable.create((observer) => {
      this.session.dialog('/', (event) => {
        this.storeAddresses.set(
          <string> R.path(['message', 'address', 'id'], event),
          <object> R.path(['message', 'address'], event));
        this.storeUsers.set(
          <string> R.path(['message', 'user', 'id'], event),
          <object> R.path(['message', 'user'], event));

        return Promise.resolve(event.message)
          .then((normalized) => this.parser.parse(normalized))
          .then((parsed) => this.parser.validate(parsed))
          .then((validated) => {
            if (validated) { return observer.next(validated); }
            return null;
          })
          .catch((error) => this.logger.error(error));
      });
    });
  }

  public send(data: object): Promise<object> {
    this.logger.debug('sending', { message: data });
    return schemas(data, 'send')
      .then(() => {
        const context: string = <string> R.path(['object', 'context', 'content'], data);
        const content: string = <string> R.path(['object', 'content'], data);
        const name: string = <string> R.path(['object', 'name'], data);
        const objectType: string = <string> R.path(['object', 'type'], data);

        const contextArr = R.split('#', context);
        const addressID = contextArr[0];

        let address = this.storeAddresses.get(addressID);
        if (!address) {
          if (R.length(contextArr) !== 4) {
            return Promise
              .reject(new Error('Context value should use the form: address.id#address.conversation.id#channelId#bot.id'));
          }

          const conversationID = contextArr[1];
          const channelID = contextArr[2];
          const botID = contextArr[3];
          const userID = R.path(['to', 'id'], data);

          address = {
            bot: {
              id: botID,
            },
            channelId: channelID,
            conversation: {
              id: conversationID,
            },
            id: addressID,
            serviceUrl: `https://${channelID}.botframework.com`,
            useAuth: true,
            user: {
              id: userID,
            },
          };
        }

        // Process attachment
        const attachmentButtons = R.filter(
          (attachment: any) => attachment.type === 'Button',
          <any[]> R.path(['object', 'attachment'], data) || []);

        const messageButtons = R.map(
          (button) => {
            return new botbuilder.CardAction()
              .type('imBack')
              .value(button.url)
              .title(button.name || button.content || 'Click to send response to bot');
          },
          attachmentButtons);

        let messageAttachments: any[] = [];
        const messageBuilder = new botbuilder.Message()
          .textFormat(botbuilder.TextFormat.markdown)
          .address(<botbuilder.IAddress> address);

        if (objectType === 'Note') {
          if (!messageButtons) {
            messageBuilder.text(content);
          } else {
            messageAttachments = [
              new botbuilder.HeroCard()
                .title(name)
                .text(content)
                .buttons(messageButtons),
            ];
          }
        } else if (objectType === 'Image' || objectType === 'Video') {
          const url: string = <string> R.path(['object', 'url'], data);
          const hero = new botbuilder.HeroCard()
            .title(name)
            .text(content);

          if (messageButtons) {
            hero.buttons(messageButtons);
          }

          if (objectType === 'Image') {
            hero.images([new botbuilder.CardImage().url(url)]);
            messageAttachments = [hero];
          } else {
            messageAttachments = [{
              contentType: mimetype.lookup(url),
              contentUrl: url,
            }, hero];
          }
        }

        if (objectType === 'Note' || objectType === 'Image' || objectType === 'Video') {
          messageBuilder.attachments(messageAttachments);
          return Promise.fromCallback((cb) => this.session.send(messageBuilder, cb))
            .then(() => ({ serviceID: this.serviceId(), type: 'sent' }));
        }

        return Promise.reject(new Error('Only Note, Image, and Video are supported.'));
      });
  }
}

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
import * as KikBot from '@kikinteractive/kik';
import * as Promise from 'bluebird';
import broidSchemas from '@broid/schemas';
import { Logger } from '@broid/utils';
import * as uuid from 'node-uuid';
import * as R from 'ramda';
import { Observable } from 'rxjs/Rx';

import { IAdapterHTTPOptions, IAdapterOptions } from './interfaces';
import { Parser } from './Parser';
import { WebHookServer } from './WebHookServer';

export class Adapter {
  private serviceID: string;
  private token: string | null;
  private HTTPOptions: IAdapterHTTPOptions;
  private connected: boolean;
  private session: any;
  private parser: Parser;
  private logLevel: string;
  private username: string;
  private logger: Logger;
  private webhookServer: WebHookServer;
  private storeUsers: Map<string, object>;

  constructor(obj?: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || 'info';
    this.token = obj && obj.token || null;
    this.username = obj && obj.username || 'SMS';
    this.storeUsers = new Map();

    const HTTPOptions: IAdapterHTTPOptions = {
      host: '127.0.0.1',
      port: 8080,
      webhookURL: 'http://127.0.0.1/',
    };
    this.HTTPOptions = obj && obj.http || HTTPOptions;
    this.HTTPOptions.host = this.HTTPOptions.host || HTTPOptions.host;
    this.HTTPOptions.port = this.HTTPOptions.port || HTTPOptions.port;
    this.HTTPOptions.webhookURL = this.HTTPOptions.webhookURL || HTTPOptions.webhookURL;
    this.HTTPOptions.webhookURL = this.HTTPOptions.webhookURL
      .replace(/\/?$/, '/');

    this.parser = new Parser(this.serviceID, this.logLevel);
    this.logger = new Logger('adapter', this.logLevel);
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

  // Connect to Kik
  // Start the webhook server
  public connect(): Observable<object> {
    if (this.connected) {
      return Observable.of({ type: 'connected', serviceID: this.serviceId() });
    }
    this.connected = true;

    if (!this.token || !this.username || !this.HTTPOptions.webhookURL) {
      return Observable.throw(new Error('Credentials should exist.'));
    }

    this.session = new KikBot({
      apiKey: this.token,
      baseUrl: this.HTTPOptions.webhookURL,
      username: this.username,
    });

    this.webhookServer = new WebHookServer(this.HTTPOptions, this.logLevel);
    this.webhookServer.listen(this.session.incoming());

    return Observable.of({ type: 'connected', serviceID: this.serviceId() });
  }

  public disconnect(): Promise {
    return Promise.reject(new Error('Not supported'));
  }

  // Listen 'message' event from Kik
  public listen(): Observable<object> {
    if (!this.session) {
      return Observable.throw(new Error('No session found.'));
    }
    this.session.updateBotConfiguration();

    return Observable.create((observer) => {
      this.session.use((incoming, next) => {
        next(); // we assume all is good

        this.user(incoming.from, true)
          .then((userInformation) =>
            this.parser.normalize(incoming, userInformation))
          .then((normalized) => this.parser.parse(normalized))
          .then((parsed) => this.parser.validate(parsed))
          .then((validated) => {
            if (validated) { observer.next(validated); }
            return null;
          });
      });
    });
  }

  public send(data: object): Promise {
    this.logger.debug('sending', { message: data });
    return broidSchemas(data, 'send')
      .then(() => {
        const toID: string = R.path(['to', 'id'], data)
          || R.path(['to', 'name'], data);
        const type: string = R.path(['object', 'type'], data);

        const attachments = R.path(['object', 'attachment'], data);

        // Keyboards can be applied to any of the following message types: Image, Video, Note
        let buttons = R.filter((attachment) => attachment.type === 'Button',
          attachments || []);
        buttons = R.map((button) => button.url || button.name, buttons);
        buttons = R.reject(R.isNil)(buttons);

        return Promise.resolve(buttons)
          .then((btns) => {
            if (type === 'Image' || type === 'Video') {
              const url = R.path(['object', 'url'], data);
              const name = R.path(['object', 'name'], data) || '';

              let message = KikBot.Message.picture(url)
                .setAttributionName(name)
                .setAttributionIcon(R.path(['object', 'preview'], data) || url);
              if (type === 'Video') {
                message = KikBot.Message.video(url)
                  .setAttributionName(name)
                  .setAttributionIcon(R.path(['object', 'preview'], data));
              }

              return [btns, message];
            } else if (type === 'Note') {
              return [btns, KikBot.Message.text(R.path(['object', 'content'],
                data))];
            }

            return [null, null];
          })
          .spread((btns, content) => {
            if (content) {
              if (btns && !R.isEmpty(btns)) {
                content.addResponseKeyboard(btns, false, toID);
              }

              return this.session.send(content, toID)
                .then(() => ({ type: 'sent', serviceID: this.serviceId() }));
            }

            throw new Error('Only Note, Image, and Video are supported.');
          });
      });
  }

  // Return user information
  private user(key: string, cache: boolean = true): Promise {
    if (!this.session) {
      return Promise.reject(new Error('Session should be initilized before.'));
    }

    if (cache && this.storeUsers.get(key)) {
      const data = this.storeUsers.get(key);
      return Promise.resolve(data);
    }

    return this.session.getUserProfile(key)
      .then((profile) => {
        return {
          displayName: profile.displayName,
          firstName: profile.firstName,
          id: key,
          lastName: profile.lastName,
          profilePicLastModified: profile.profilePicLastModified,
          profilePicUrl: profile.profilePicUrl,
          username: profile.username,
        };
      })
      .then((data) => {
        this.storeUsers.set(key, data);
        return data;
      });
  }
}

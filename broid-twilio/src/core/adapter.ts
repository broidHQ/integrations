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
import * as uuid from 'node-uuid';
import * as R from 'ramda';
import { Observable } from 'rxjs/Rx';
import * as twilio from 'twilio';

import { IAdapterHTTPOptions, IAdapterOptions, ITwilioWebHookEvent } from './interfaces';
import { Parser } from './Parser';
import { WebHookServer } from './WebHookServer';

export class Adapter {
  private serviceID: string;
  private token: string | null;
  private tokenSecret: string | null;
  private optionsHTTP: IAdapterHTTPOptions;
  private connected: boolean;
  private session: any;
  private parser: Parser;
  private logLevel: string;
  private username: string;
  private logger: Logger;
  private webhookServer: WebHookServer;

  constructor(obj?: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || 'info';
    this.token = obj && obj.token || null;
    this.tokenSecret = obj && obj.tokenSecret || null;
    this.username = obj && obj.username || 'SMS';

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
  public users(): Promise<Error> {
    return Promise.reject(new Error('Not supported'));
  }

  // Return list of channels information
  public channels(): Promise<Error> {
    return Promise.reject(new Error('Not supported'));
  }

  // Return the service ID of the current instance
  public serviceId(): string {
    return this.serviceID;
  }

  // Connect to Twilio
  // Start the webhook server
  public connect(): Observable<object> {
    if (this.connected) {
      return Observable.of({ type: 'connected', serviceID: this.serviceId() });
    }
    this.connected = true;

    if (!this.token
      || !this.tokenSecret) {
      return Observable.throw(new Error('Credentials should exist.'));
    }

    this.session = new twilio.RestClient(this.token, this.tokenSecret);
    this.webhookServer = new WebHookServer(this.optionsHTTP, this.logLevel);
    this.webhookServer.listen();

    return Observable.of({ type: 'connected', serviceID: this.serviceId() });
  }

  public disconnect(): Promise<object> {
    return Promise.reject(new Error('Not supported'));
  }

  // Listen 'message' event from Twilio
  public listen(): Observable<object | Error> {
    if (!this.session) {
      return Observable.throw(new Error('No session found.'));
    }

    return Observable.fromEvent(this.webhookServer, 'message')
      .mergeMap((event: ITwilioWebHookEvent) => this.parser.normalize(event))
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
        const toNumber: string = <string> R.path(['to', 'id'], data)
          || <string> R.path(['to', 'name'], data);
        const dataType: string = <string> R.path(['object', 'type'], data);
        let content: string = <string> R.path(['object', 'content'], data)
          || <string> R.path(['object', 'name'], data);

        if (dataType === 'Image' || dataType === 'Video') {
          content = <string> R.path(['object', 'url'], data)
            || <string> R.path(['object', 'content'], data)
            || <string> R.path(['object', 'name'], data);
        }

        if (dataType === 'Note' || dataType === 'Image' || dataType === 'Video') {
          const sms = {
            body: content,
            from: this.username,
            to: toNumber,
          };

          return new Promise((resolve, reject) => {
            return this.session.messages.create(sms, (err) => {
              if (err) { return reject(err); }
              return resolve({ type: 'sent', serviceID: this.serviceId() });
            });
          });
        }

        return Promise.reject(new Error('Only Note, Image, and Video are supported.'));
      });
  }
}

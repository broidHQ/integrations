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
import * as Nexmo from 'nexmo';
import * as uuid from 'node-uuid';
import * as R from 'ramda';
import { Observable } from 'rxjs/Rx';

import { IAdapterHTTPOptions, IAdapterOptions } from './interfaces';
import { Parser } from './Parser';
import { WebHookServer } from './WebHookServer';

export class Adapter {
  private serviceID: string;
  private username: string | null;
  private token: string | null;
  private tokenSecret: string | null;
  private optionsHTTP: IAdapterHTTPOptions;
  private connected: boolean;
  private parser: Parser;
  private logLevel: string;
  private logger: Logger;
  private webhookServer: WebHookServer;
  private session: any;

  constructor(obj?: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || 'info';
    this.token = obj && obj.token || null;
    this.tokenSecret = obj && obj.tokenSecret || null;
    this.username = obj && obj.username || null;

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

  // Connect to Nexmo
  // Start the webhook server
  public connect(): Observable<object> {
    if (this.connected) {
      return Observable.of({ type: 'connected', serviceID: this.serviceId() });
    }
    this.connected = true;

    if (!this.token || this.token === '') {
      return Observable.throw(new Error('Token should exist.'));
    }

    if (!this.tokenSecret || this.tokenSecret === '') {
      return Observable.throw(new Error('TokenSecret should exist.'));
    }

    this.session = new Nexmo({
      apiKey: this.token,
      apiSecret: this.tokenSecret,
    });

    this.webhookServer = new WebHookServer(this.optionsHTTP, this.logLevel);
    this.webhookServer.listen();

    return Observable.of(({ type: 'connected', serviceID: this.serviceId() }));
  }

  public disconnect(): Promise<Error> {
    return Promise.reject(new Error('Not supported'));
  }

  // Listen 'message' event from Nexmo
  public listen(): Observable<object> {
    if (!this.webhookServer) {
      return Observable.throw(new Error('No webhookServer found.'));
    }

    return Observable.fromEvent(this.webhookServer, 'message')
      .mergeMap((normalized: any) =>
        this.parser.parse(normalized))
      .mergeMap((parsed) => this.parser.validate(parsed))
      .mergeMap((validated) => {
        if (!validated) { return Observable.empty(); }
        return Promise.resolve(validated);
      });
  }

  public send(data: any): Promise<object | Error> {
    this.logger.debug('sending', { message: data });
    return schemas(data, 'send')
      .then(() => {
        if (data.object.type !== 'Note') {
          return Promise.reject(new Error('Only Note is supported.'));
        }

        return Promise.resolve(data)
          .then((result: any) => {
            const toNumber = R.path(['to', 'id'], result);
            const content = R.path(['object', 'content'], result);
            return Promise.fromCallback((cb) =>
              this.session.message.sendSms(this.username, toNumber, content, {}, cb));
          })
          .then((result) => {
            const ids = R.map((message) => message['message-id'], result.messages);
            return { type: 'sent', serviceID: this.serviceId(), ids };
          });
      });
  }
}

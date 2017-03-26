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
import * as Callr from 'callr';
import * as uuid from 'node-uuid';
import * as R from 'ramda';
import { Observable } from 'rxjs/Rx';

import { IAdapterHTTPOptions, IAdapterOptions, ICallrWebHookEvent } from './interfaces';
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
      webhookURL: 'http://127.0.0.1/',
    };
    this.optionsHTTP = obj && obj.http || optionsHTTP;
    this.optionsHTTP.host = this.optionsHTTP.host || optionsHTTP.host;
    this.optionsHTTP.port = this.optionsHTTP.port || optionsHTTP.port;
    this.optionsHTTP.webhookURL = this.optionsHTTP.webhookURL || optionsHTTP.webhookURL;
    this.optionsHTTP.webhookURL = this.optionsHTTP.webhookURL
      .replace(/\/?$/, '/');

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

  // Connect to Callr
  // Start the webhook server
  public connect(): Observable<Promise<any>> {
    if (this.connected) {
      return Observable.of(Promise.resolve({ type: 'connected', serviceID: this.serviceId() }));
    }

    this.connected = true;

    if (!this.token || !this.tokenSecret) {
      return Observable.throw(new Error('Credentials should exist.'));
    }

    this.session = new Callr.api(this.token, this.tokenSecret);
    this.webhookServer = new WebHookServer(this.optionsHTTP, this.logLevel);
    this.webhookServer.listen();

    return Observable.fromPromise(new Promise((resolve, reject) => {
      this.session
        .call('webhooks.subscribe', 'sms.mo', this.optionsHTTP.webhookURL, null)
        .success(() => resolve(true))
        .error((error) => {
          this.logger.warning(error);
          if (R.contains(error.message, ['TYPE_ENDPOINT_DUPLICATE', 'HTTP_CODE_ERROR'])) {
            resolve(null);
          }
          reject(error);
        });
    })
    .then(() => ({ type: 'connected', serviceID: this.serviceId() })));
  }

  public disconnect(): Promise<Error> {
    return Promise.reject(new Error('Not supported'));
  }

  // Listen 'message' event from Callr
  public listen(): Observable<object> {
    if (!this.session) {
      return Observable.throw(new Error('No session found.'));
    }

    return Observable.fromEvent(this.webhookServer, 'message')
      .mergeMap((event: ICallrWebHookEvent) => this.parser.normalize(event))
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
        const toNumber: string = <string> R.path(['to', 'id'], data)
          || <string> R.path(['to', 'name'], data);
        const dataType: string = <string> R.path(['object', 'type'], data);
        let content: string = <string> R.path(['object', 'content'], data)
          || <string> R.path(['object', 'name'], data);

        if (dataType === 'Image' || dataType === 'Video') {
          content = <string> R.path(['object', 'url'], data) || <string> R.path(['object', 'content'], data)
            || <string> R.path(['object', 'name'], data);
        }

        if (dataType === 'Note' || dataType === 'Image' || dataType === 'Video') {
          return new Promise((resolve, reject) => {
            return this.session.call('sms.send', this.username, toNumber, content, null)
              .success(() => resolve({ type: 'sent', serviceID: this.serviceId() }))
              .error((error) => reject(error));
          });
        }

        return Promise.reject(new Error('Note, Image, Video are only supported.'));
      });
  }
}

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
import { Observable } from 'rxjs/Rx';

import { IAdapterHTTPOptions, IAdapterOptions } from './interfaces';
import { Parser } from './Parser';
import { WebHookServer } from './WebHookServer';

export class Adapter {
  private serviceID: string;
  private optionsHTTP: IAdapterHTTPOptions;
  private connected: boolean;
  private parser: Parser;
  private logLevel: string;
  private logger: Logger;
  private webhookServer: WebHookServer;
  // private session: any;

  constructor(obj?: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || 'info';

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

        const content: string = data.object.content;
        const to: string = data.to.id;

        let outputSpeech: any = {
          text: content,
          type: 'PlainText',
        };

        if (content.startsWith('<speak>') && content.endsWith('</speak>')) {
          outputSpeech = {
            ssml: content,
            type: 'SSML',
          };
        }

        const card: any = {
          content,
          title: data.object.name || '',
          type: 'Simple',
        };

        const response: any = {
          response: {
            card,
            outputSpeech,
            shouldEndSession: true,
          },
        };

        this.webhookServer.emit(`response:${to}`, response);
        return Promise.resolve({ type: 'sent', serviceID: this.serviceId() });
      });
  }
}

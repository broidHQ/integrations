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
import { Logger } from '@broid/utils';

import * as Promise from 'bluebird';
import { EventEmitter } from 'events';
import { Router  } from 'express';
import * as uuid from 'node-uuid';
import * as R from 'ramda';
import { Observable } from 'rxjs/Rx';

import { IAdapterOptions } from './interfaces';
import { Parser } from './Parser';
import { WebHookServer } from './WebHookServer';

export class Adapter {
  private serviceID: string;
  private connected: boolean;
  private emitter: EventEmitter;
  private parser: Parser;
  private logLevel: string;
  private logger: Logger;
  private router: Router;
  private webhookServer: WebHookServer | null;

  constructor(obj?: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || 'info';

    this.emitter = new EventEmitter();
    this.parser = new Parser(this.serviceName(), this.serviceID, this.logLevel);
    this.logger = new Logger('adapter', this.logLevel);
    this.router = this.setupRouter();

    if (obj && obj.http) {
      this.webhookServer = new WebHookServer(obj.http, this.router, this.logLevel);
    }
  }

  // Return the name of the Service/Integration
  public serviceName(): string {
    return 'alexa';
  }

  // Returns the intialized express router
  public getRouter(): Router | null {
    if (this.webhookServer) {
      return null;
    }
    return this.router;
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

    if (this.webhookServer) {
     this.connected = true;
     this.webhookServer.listen();
    }

    return Observable.of(({ type: 'connected', serviceID: this.serviceId() }));
  }

  public disconnect(): Promise<null> {
    if (this.webhookServer) {
      return this.webhookServer.close();
    }
    return Promise.resolve(null);
  }

  // Listen 'message' event from Nexmo
  public listen(): Observable<object> {
    return Observable.fromEvent(this.emitter, 'message')
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
    return broidSchemas(data, 'send')
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

        this.emitter.emit(`response:${to}`, response);
        return Promise.resolve({ type: 'sent', serviceID: this.serviceId() });
      });
  }

  private setupRouter(): Router {
    const router = Router();
    const handle = (req, res) => {
      const request = req.body.request;
      const session = req.body.session;

      const requestType = request.type;
      const intentName = requestType === 'IntentRequest'
        ? R.path(['intent', 'name'], request) :
        requestType;

      const messageID = uuid.v4();
      const message: any = {
        application: session.application,
        intentName,
        messageID,
        requestType,
        slots: R.path(['intent', 'slots'], request) || {},
        user: session.user,
      };

      const responseListener = (data) => res.json(data);
      this.emitter.emit('message', message);
      this.emitter.once(`response:${messageID}`, responseListener);

      // save memory
      setTimeout(() =>
        this.emitter.removeListener(`response:${messageID}`, responseListener)
      , 60000);

      res.sendStatus(200);
    };

    router.get('/', handle);
    router.post('/', handle);

    return router;
  }
}

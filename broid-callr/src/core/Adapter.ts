import schemas from '@broid/schemas';
import { Logger } from '@broid/utils';

import * as Promise from 'bluebird';
import * as Callr from 'callr';
import * as EventEmitter from 'events';
import { Router } from 'express';
import * as R from 'ramda';
import { Observable } from 'rxjs/Rx';
import * as uuid from 'uuid';

import { IAdapterOptions, ICallrWebHookEvent } from './interfaces';
import { Parser } from './Parser';
import { WebHookServer } from './WebHookServer';

export class Adapter {
  private serviceID: string;
  private token: string | null;
  private tokenSecret: string | null;
  private connected: boolean;
  private emitter: EventEmitter;
  private session: any;
  private parser: Parser;
  private logLevel: string;
  private username: string;
  private logger: Logger;
  private router: Router;
  private webhookServer: WebHookServer | null;
  private webhookURL: string;

  constructor(obj: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || 'info';
    this.token = obj && obj.token || null;
    this.tokenSecret = obj && obj.tokenSecret || null;
    this.username = obj && obj.username || 'SMS';
    this.webhookURL = obj && obj.webhookURL.replace(/\/?$/, '/') || '';

    this.emitter = new EventEmitter();
    this.parser = new Parser(this.serviceName(), this.serviceID, this.logLevel);
    this.logger = new Logger('adapter', this.logLevel);
    this.router = this.setupRouter();

    if (obj.http) {
      this.webhookServer = new WebHookServer(obj.http, this.router, this.logLevel);
    }
  }

  // Return list of users information
  public users(): Promise<Error> {
    return Promise.reject(new Error('Not supported'));
  }

  // Return list of channels information
  public channels(): Promise<Error> {
    return Promise.reject(new Error('Not supported'));
  }

  // Return the name of the Service/Integration
  public serviceName(): string {
    return 'callr';
  }

  // Return the service ID of the current instance
  public serviceId(): string {
    return this.serviceID;
  }

  // Returns the intialized express router
  public getRouter(): Router {
    if (this.webhookServer) {
      return false;
    }

    return this.router;
  }

  // Connect to Callr
  // Start the webhook server
  public connect(): Observable<object> {
    if (this.connected) {
      return Observable.of({ type: 'connected', serviceID: this.serviceId() });
    }

    if (!this.token || !this.tokenSecret) {
      return Observable.throw(new Error('Credentials should exist.'));
    }

    if (!this.webhookURL) {
      return Observable.throw(new Error('webhookURL should exist.'));
    }

    this.connected = true;

    this.session = new Callr.api(this.token, this.tokenSecret);
    if (this.webhookServer) {
      this.webhookServer.listen();
    }

    return Observable.fromPromise(new Promise((resolve, reject) => {
      this.session
        .call('webhooks.subscribe', 'sms.mo', this.webhookURL, null)
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

  public disconnect(): Promise<null> {
    this.connected = false;

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

    return Observable.fromEvent(this.emitter, 'message')
      .switchMap((value) => {
        return Observable.of(value)
        .mergeMap((event: ICallrWebHookEvent) => this.parser.normalize(event))
        .mergeMap((normalized) => this.parser.parse(normalized))
        .mergeMap((parsed) => this.parser.validate(parsed))
        .mergeMap((validated) => {
          if (!validated) { return Observable.empty(); }
          return Promise.resolve(validated);
        });
      })
      .mergeMap((value) => {
        if (value instanceof Error) {
          return Observable.empty();
        }
        return Promise.resolve(value);
      });
  }

  public send(data: object): Promise<object | Error> {
    this.logger.debug('sending', { message: data });
    return schemas(data, 'send')
      .then(() => {
        const toNumber: string = R.path(['to', 'id'], data) as string
          || R.path(['to', 'name'], data) as string;
        const objectType: string = R.path(['object', 'type'], data) as string;
        let content: string = R.path(['object', 'content'], data) as string
          || R.path(['object', 'name'], data) as string;

        if (objectType === 'Image' || objectType === 'Video') {
          content = R.path(['object', 'url'], data) as string ||
            R.path(['object', 'content'], data) as string
            || R.path(['object', 'name'], data) as string;
        }

        if (objectType === 'Note' || objectType === 'Image' || objectType === 'Video') {
          return new Promise((resolve, reject) => {
            return this.session.call('sms.send', this.username, toNumber, content, null)
              .success(() => resolve({ type: 'sent', serviceID: this.serviceId() }))
              .error((error) => reject(error));
          });
        }

        return Promise.reject(new Error('Note, Image, Video are only supported.'));
      });
  }

  private setupRouter(): Router {
    const router = Router();
    router.post('/', (req, res) => {
      const event: ICallrWebHookEvent = {
        request: req,
        response: res,
      };

      this.emitter.emit('message', event);
      res.send('');
    });

    return router;
  }
}

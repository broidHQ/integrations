import schemas from '@broid/schemas';
import { concat, Logger } from '@broid/utils';
import * as Promise from 'bluebird';
import { EventEmitter } from 'events';
import { Router } from 'express';
import * as uuid from 'node-uuid';
import * as R from 'ramda';
import * as rp from 'request-promise';
import { Observable } from 'rxjs/Rx';

import { createAttachment, createButtons, parseQuickReplies } from './helpers';
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
    this.emitter = new EventEmitter();

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

    if (!this.token || !this.tokenSecret) {
      return Observable.throw(new Error('Credentials should exist.'));
    }

    if (this.webhookServer) {
      this.webhookServer.listen();
    }

    this.connected = true;
    return Observable.of({ type: 'connected', serviceID: this.serviceId() });
  }

  public disconnect(): Promise<null> {
    this.connected = false;
    return Promise.resolve(null);
  }

  // Listen 'message' event from Messenger
  public listen(): Observable<object> {
    return Observable.fromEvent(this.emitter, 'message')
      .mergeMap((event: IWebHookEvent) => this.parser.normalize(event))
      .mergeMap((messages: any) => {
        if (!messages || R.isEmpty(messages)) { return Observable.empty(); }
        return Observable.from(messages);
      })
      .mergeMap((message: any) => this.user(message.author)
        .then((author) => R.assoc('authorInformation', author, message)))
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
        const toID: string = R.path(['to', 'id'], data) as string ||
          R.path(['to', 'name'], data) as string;
        const dataType: string = R.path(['object', 'type'], data) as string;
        const content: string = R.path(['object', 'content'], data) as string;
        const name: string = R.path(['object', 'name'], data) as string || content;
        const attachments: any[] = R.path(['object', 'attachment'], data) as any[] || [];
        const buttons = R.filter(
          (attachment: any) => attachment.type === 'Button',
          attachments);
        const quickReplies = R.filter(
          (button: any) => button.mediaType === 'application/vnd.geo+json',
          buttons);
        const fButtons = createButtons(buttons);
        const fbQuickReplies = parseQuickReplies(quickReplies);
        const messageData: any = {
          message: { attachment: {}, text: '' },
          recipient: { id: toID },
        };

        // Add Quick Reply
        if (R.length(fbQuickReplies) > 0) {
          messageData.message.quick_replies = fbQuickReplies;
        }

        if (dataType === 'Image' || dataType === 'Video') {
          if (dataType === 'Video' && R.isEmpty(fButtons)) {
            messageData.message.text = concat([
              R.path(['object', 'name'], data) || '',
              R.path(['object', 'content'], data) || '',
              R.path(['object', 'url'], data),
            ]);
          } else {
            messageData.message.attachment = createAttachment(name, content, fButtons,
                                                              R.path(['object', 'url'], data));
          }
        } else if (dataType === 'Note') {
          if (!R.isEmpty(fButtons)) {
            messageData.message.attachment = createAttachment(name, content, fButtons);
          } else {
            messageData.message.text = R.path(['object', 'content'], data);
            delete messageData.message.attachment;
          }
        }

        if (dataType === 'Note' || dataType === 'Image' || dataType === 'Video') {
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
  private user(id: string,
               fields: string = 'first_name,last_name',
               cache: boolean = true): Promise<object> {
    const key: string = `${id}${fields}`;
    if (cache) {
      const data = this.storeUsers.get(key);
      if (data) {
        return Promise.resolve(data);
      }
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

import schemas from '@broid/schemas';
import { Logger } from '@broid/utils';

import * as Promise from 'bluebird';
import { Router } from 'express';
import * as TelegramBot from 'node-telegram-bot-api';
import * as uuid from 'node-uuid';
import * as R from 'ramda';
import * as request from 'request-promise';
import { Observable } from 'rxjs/Rx';

import { IAdapterOptions } from './interfaces';
import { Parser } from './Parser';
import { WebHookServer } from './WebHookServer';

const sortByFileSize = R.compose(R.reverse, R.sortBy(R.prop('file_size')));

// Escape special Markdown formatting characters, so we don't receive a
// 'Bad Request: Can't parse message text: Can't find end of the entity '
// 'starting at byte offset ___' error.
// See https://core.telegram.org/bots/api#markdown-style for characters.
const markdown = (str) => str.replace(/[\*_\[`]/g, '\\$&');

export class Adapter {
  private connected: boolean;
  private serviceID: string;
  private token: string | null;
  private session: any;
  private parser: Parser;
  private logLevel: string;
  private logger: Logger;
  private router: Router;
  private webhookServer: WebHookServer | null;
  private webhookURL: string;

  constructor(obj: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || 'info';
    this.token = obj && obj.token || null;

    if (this.token === '') {
      throw new Error('Token should exist.');
    }

    this.webhookURL = obj.webhookURL.replace(/\/?$/, '/');

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

  // Return the service ID of the current instance
  public serviceId(): string {
    return this.serviceID;
  }

  // Return the service Name of the current instance
  public serviceName(): string {
    return 'telegram';
  }

  // Returns the intialized express router
  public getRouter(): Router | null {
    if (this.webhookServer) {
      return null;
    }
    return this.router;
  }

  // Connect to Telegram
  public connect(): Observable<object> {
    if (this.connected) {
      return Observable.of({ type: 'connected', serviceID: this.serviceId() });
    }

    if (!this.token || !this.webhookURL) {
      return Observable.throw(new Error('Credentials should exist.'));
    }

    if (this.webhookServer) {
      this.webhookServer.listen();
    }

    this.session = new TelegramBot(this.token);
    this.session.setWebHook(`${this.webhookURL}${this.serviceId()}`);

    this.connected = true;
    return Observable.of({ type: 'connected', serviceID: this.serviceId() });
  }

  public disconnect(): Promise<null> {
    this.connected = true;
    if (this.webhookServer) {
      return this.webhookServer.close();
    }

    return Promise.resolve(null);
  }

  // Listen 'message' event from Telegram
  public listen(): Observable<object> {
    if (!this.session) {
      return Observable.throw(new Error('No session found.'));
    }

    return Observable.merge(
      Observable.fromEvent(this.session, 'callback_query')
        .map(R.assoc('_event', 'callback_query')),
      Observable.fromEvent(this.session, 'inline_query')
        .map(R.assoc('_event', 'inline_query')),
      Observable.fromEvent(this.session, 'chosen_inline_result')
        .map(R.assoc('_event', 'chosen_inline_result')),
      Observable.fromEvent(this.session, 'message')
        .map(R.assoc('_event', 'message')))
      .mergeMap((event) => this.parser.normalize(event))
      .mergeMap((data: any) => {
        const normalized: any = data;
        if (data.text) {
          normalized.type = 'Note';
          return Promise.resolve(normalized);
        } else if (data.photo || data.video) {
          let file = data.photo;
          if (R.is(Array, data.photo)) {
            normalized.type = 'Image';
            normalized.photo = sortByFileSize(data.photo);
            file = normalized.photo[0];
          }

          if (data.video) {
            file = data.video;
            if (R.is(Array, data.video)) {
              normalized.type = 'Video';
              normalized.video = sortByFileSize(data.video);
              file = normalized.video[0];
            }
          }

          const fileID = R.path(['file_id'], file);
          return this.session.getFileLink(fileID)
            .then((link) => {
              normalized.text = link;
              return normalized;
            });
        }

        this.logger.warning(new Error('This event is not supported.'));
        return Promise.resolve(null);
      })
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
        const options: any = { parse_mode: 'Markdown' };
        const objectType = R.path(['object', 'type'], data);
        const toID: string = R.path(['to', 'id'], data) as string
          || R.path(['to', 'name'], data) as string;

        const confirm = () => ({ type: 'sent', serviceID: this.serviceId() });

        if (objectType === 'Image' || objectType === 'Video') {
          const url: string = R.path(['object', 'url'], data) as string;
          if (url.startsWith('http://') || url.startsWith('https://')) {
            const stream = request(url);
            if (objectType === 'Image') {
              return this.session.sendPhoto(toID, stream)
                .then(confirm);
            }

            return this.session.sendVideo(toID, stream)
              .then(confirm);
          }

          return Promise.reject(new Error('File path should be URI'));
        } else if (objectType === 'Note') {
          // Quick Reply
          const attachmentButtons = R.filter(
            (attachment: any) => attachment.type === 'Button',
            R.path(['object', 'attachment'], data) as any[] || []);
          let buttons = R.map(
            (button: any) => {
              if (R.contains(button.mediaType, ['text/html'])) {
                return [{ text: button.name, url: button.url }];
              }
              return [{ text: button.name, callback_data: button.url }];
            },
            attachmentButtons);
          buttons = R.reject(R.isNil)(buttons);

          if (!R.isEmpty(buttons)) {
            options.reply_markup = options.reply_markup || { inline_keyboard: [] };
            options.reply_markup.inline_keyboard = options.reply_markup.inline_keyboard || [];
            options.reply_markup.inline_keyboard = R.concat(
              options.reply_markup.inline_keyboard,
              buttons);
          }

          const content = R.path(['object', 'content'], data);
          if (content && content !== '') {
            return this.session.sendMessage(toID, markdown(content), options)
              .then(confirm);
          }
        }

        return Promise.reject(new Error('Only Note, Image, and Video are supported.'));
      });
  }

  private setupRouter(): Router {
    const router = Router();
    const handle = (req, res) => {
      this.session.processUpdate(req.body);
      res.sendStatus(200);
    };

    router.post(`/${this.serviceId()}`, handle);
    router.get(`/${this.serviceId()}`, handle);

    return router;
  }
}

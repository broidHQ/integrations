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
import * as Promise from 'bluebird';
import broidSchemas from '@broid/schemas';
import { Logger } from '@broid/utils';
import * as LineBot from 'line-messaging';
import * as uuid from 'node-uuid';
import * as R from 'ramda';
import { Observable } from 'rxjs/Rx';

import { IAdapterHTTPOptions, IAdapterOptions } from './interfaces';
import { Parser } from './Parser';

export class Adapter {
  private connected: boolean;
  private HTTPOptions: IAdapterHTTPOptions;
  private logLevel: string;
  private logger: Logger;
  private parser: Parser;
  private serviceID: string;
  private session: LineBot;
  private storeUsers: Map<string, object>;
  private token: string | null;
  private tokenSecret: string | null;
  private username: string | null;

  constructor(obj?: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || 'info';
    this.token = obj && obj.token || null;
    this.tokenSecret = obj && obj.tokenSecret || null;
    this.username = obj && obj.username || null;
    this.storeUsers = new Map();

    const HTTPOptions: IAdapterHTTPOptions = {
      host: '127.0.0.1',
      port: 8080,
    };
    this.HTTPOptions = obj && obj.http || HTTPOptions;
    this.HTTPOptions.host = this.HTTPOptions.host || HTTPOptions.host;
    this.HTTPOptions.port = this.HTTPOptions.port || HTTPOptions.port;

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

  // Connect to Messenger
  // Start the webhook server
  public connect(): Observable<object> {
    if (this.connected) {
      return Observable.of({ type: 'connected', serviceID: this.serviceId() });
    }

    if (!this.token || !this.tokenSecret || !this.username) {
      return Observable.throw(new Error('Credentials should exist.'));
    }

    this.connected = true;
    this.session = LineBot.create({
      channelID: this.username,
      channelSecret: this.tokenSecret,
      channelToken: this.token,
    });

    this.session.webhook('/');

    this.session.listen(this.HTTPOptions.port, this.HTTPOptions.host, () => {
      this.logger.info(`Server listening at port ${this.HTTPOptions.host}:${this.HTTPOptions.port}...`);
    });

    return Observable.of({ type: 'connected', serviceID: this.serviceId() });
  }

  public disconnect(): Promise {
    return Promise.reject(new Error('Not supported'));
  }

  // Listen 'message' event from Messenger
  public listen(): Observable<object> {
    return Observable.merge(
      Observable
        .fromEvent(this.session, LineBot.Events.MESSAGE, (...args) =>
          args[1].getEvent()),
      Observable
        .fromEvent(this.session, LineBot.Events.POSTBACK, (...args) =>
          args[1].getEvent()))
      .mergeMap((event: any) => this.parser.normalize(event))
      .mergeMap((message: any) => {
        if (R.path(['source', 'type'], message) === 'user') {
          return this.user(message.source.userId)
            .then((authorInformation) =>
                  R.assoc('source', authorInformation, message));
        }
        return Promise.resolve(message);
      })
      .mergeMap((normalized) => this.parser.parse(normalized))
      .mergeMap((parsed) => this.parser.validate(parsed))
      .mergeMap((validated) => {
        if (!validated) { return Observable.empty(); }
        return Promise.resolve(validated);
      });
  }

  public send(data: object): Promise {
    this.logger.debug('sending', { message: data });

    const createButtons = (attachments, tpl: null): any => {
      const template = tpl || new LineBot.ButtonTemplateBuilder();

      R.forEach(
        (attachment) => {
          let type = LineBot.Action.POSTBACK;
          if (attachment.mediaType === 'text/html') { type = LineBot.Action.URI; }
          template.addAction(attachment.content || attachment.name, attachment.url, type);
          return;
        },
        attachments);

      return template;
    };

    const createConfirmButton = (attachment): any => {
      const template = new LineBot.ConfirmTemplateBuilder();
      template.setMessage(attachment.content || attachment.name);
      template.setPositiveAction(attachment.yesLabel, attachment.yesLabel);
      template.setNegativeAction(attachment.noLabel, attachment.noLabel);
      return template;
    };

    return broidSchemas(data, 'send')
      .then(() => {
        const type = R.path(['object', 'type'], data);
        if (type === 'Collection') {
          let objects: any = R.path(['object', 'items'], data);
          if (!R.is(Array, objects)) { objects = [objects]; }

          const columns = R.map(
            (object) => {
              const column = createButtons(
                object.attachment || [],
                new LineBot.CarouselColumnTemplateBuilder()
              );
              column.setTitle(object.name);
              column.setMessage(object.content);
              column.setThumbnail(object.preview || object.url);

              return column;
            },
            objects);

          const carousel = new LineBot.CarouselTemplateBuilder(columns);
          return new LineBot
            .TemplateMessageBuilder('You can\'t see this rich message.', carousel);
        } else {
          const attachments = R.path(['object', 'attachment'], data);
          const content = R.path(['object', 'content'], data);
          const name = R.path(['object', 'name'], data);
          const url = R.path(['object', 'url'], data);
          const preview = R.path(['object', 'preview'], data);
          if (R.is(Array, attachments) && !R.isEmpty(attachments)) {
            const attachmentsButtons = R.filter(
              (attachment) =>
                attachment.type === 'Button' && R.isEmpty(attachment.attachment || []),
              attachments);
            const attachmentsConfirm = R.filter(
              (attachment) =>
                attachment.type === 'Button' && !R.isEmpty(attachment.attachment || []),
              attachments);

            if (!R.isEmpty(attachmentsConfirm)) {
              // we take the first confirm button
              const buttons = createConfirmButton(attachmentsConfirm[0].attachment);
              return new LineBot.TemplateMessageBuilder(content, buttons);
            } else if (!R.isEmpty(attachmentsButtons)) {
              const buttons = createButtons(attachmentsButtons, null);
              buttons.setTitle(name);
              buttons.setMessage(content);

              if (type === 'Image' && url) {
                buttons.setThumbnail(preview || url);
              }

              return new LineBot.TemplateMessageBuilder(content, buttons);
            }
          } else if (type === 'Note') {
            return new LineBot.TextMessageBuilder(content);
          } else if (type === 'Image' || type === 'Video') {
            if (url) {
              if (type === 'Video') {
                return new LineBot.VideoMessageBuilder(url, preview || url);
              }
              return new LineBot.ImageMessageBuilder(url, preview || url);
            }
          } else if (type === 'Place') {
            const latitude = R.path(['object', 'latitude'], data);
            const longitude = R.path(['object', 'longitude'], data);
            return new LineBot.LocationMessageBuilder(name || 'Location',
                                                      content, latitude, longitude);
          }
        }
      })
      .then((messageBuilder) => {
        if (messageBuilder) {
          const replyToken = R.path(['object', 'context', 'content'], data);
          if (replyToken) {
            return this.session.replyMessage(replyToken, messageBuilder);
          }

          const channelID = R.path(['to', 'id'], data);
          return this.session.pushMessage(channelID, messageBuilder);
        }

        return Promise.reject(new Error('Note, Image, Video are only supported.'));
      })
      .then(() => ({ serviceID: this.serviceId(), type: 'sent' }));
  }

  // Return user information
  private user(key: string, cache: boolean = true): Promise {
    if (cache && this.storeUsers.get(key)) {
      const data = this.storeUsers.get(key);
      return Promise.resolve(data);
    }

    return this.session.getProfile(key)
      .then((data) => {
        this.storeUsers.set(key, data);
        return data;
      });
  }
}

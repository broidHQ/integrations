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

import { CLIENT_EVENTS, RTM_EVENTS, RtmClient, WebClient } from '@slack/client';
import * as Promise from 'bluebird';
import * as uuid from 'node-uuid';
import * as R from 'ramda';
import * as rp from 'request-promise';
import { Observable } from 'rxjs/Rx';

import { createActions, createSendMessage, parseWebHookEvent } from './helpers';
import {
  IAdapterHTTPOptions,
  IAdapterOptions,
  IMessage,
  ISlackMessage,
} from './interfaces';
import { Parser } from './Parser';
import { WebHookServer } from './WebHookServer';

export class Adapter {
  private asUser: boolean;
  private connected: boolean;
  private optionsHTTP: IAdapterHTTPOptions;
  private logLevel: string;
  private logger: Logger;
  private parser: Parser;
  private serviceID: string;
  private session: RtmClient;
  private sessionWeb: WebClient;
  private storeUsers: Map<string, object>;
  private storeChannels: Map<string, object>;
  private token: string | null;
  private webhookServer: WebHookServer;

  constructor(obj?: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || 'info';
    this.token = obj && obj.token || null;
    this.asUser = obj && obj.asUser || true;
    this.storeUsers = new Map();
    this.storeChannels = new Map();

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
  public users(): Promise {
    return Promise.resolve(this.storeUsers);
  }

  // Return list of channels information
  public channels(): Promise {
    return Promise.resolve(this.storeChannels);
  }

  // Return the service ID of the current instance
  public serviceId(): string {
    return this.serviceID;
  }

  // Connect to Slack
  // Start the webhook server
  public connect(): Observable<object> {
    if (this.connected) {
      return Observable.of({ type: 'connected', serviceID: this.serviceId() });
    }

    if (!this.token) {
      return Observable.throw(new Error('Credential should exist.'));
    }

    this.connected = true;

    this.webhookServer = new WebHookServer(this.optionsHTTP, this.logLevel);
    this.webhookServer.listen();

    this.session = new RtmClient(this.token, { autoReconnect: true });
    this.sessionWeb = new WebClient(this.token);
    this.session.start();

    const connected = Observable
      .fromEvent(this.session, CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED)
      .map(() =>
        Promise.resolve({ type: 'connected', serviceID: this.serviceId() }));
    const authenticated = Observable
      .fromEvent(this.session, CLIENT_EVENTS.RTM.AUTHENTICATED)
      .map((e: any) => {
        R.forEach((user: any) => this.storeUsers.set(user.id, user), e.users || []);
        R.forEach((channel: any) => this.storeChannels.set(channel.id, channel), e.channels || []);
        return Promise.resolve({ type: 'authenticated', serviceID: this.serviceId() });
      });
    const disconnected = Observable
      .fromEvent(this.session, CLIENT_EVENTS.RTM.DISCONNECT)
      .map(() =>
        Promise.resolve({ type: 'connected', serviceID: this.serviceId() }));
    const rateLimited = Observable
      .fromEvent(this.session, CLIENT_EVENTS.WEB.RATE_LIMITED)
      .map(() =>
        Promise.resolve({ type: 'rate_limited', serviceID: this.serviceId() }));

    return Observable.merge(connected, authenticated, disconnected, rateLimited)
      .mergeAll();
  }

  public disconnect(): Promise {
    return Promise.reject(new Error('Not supported'));
  }

  // Listen 'message' event from Slack
  public listen(): Observable<object> {
    const rtmEvents = R.pick(['MESSAGE'], RTM_EVENTS);
    const events = R.map(
      (key) => Observable.fromEvent(this.session, rtmEvents[key]),
      R.keys(rtmEvents));
    const webHookEvent = Observable.fromEvent(this.webhookServer, 'message')
      .mergeMap(parseWebHookEvent);
    events.push(webHookEvent);

    return Observable.merge(...events)
      .mergeMap((event: ISlackMessage) => {
        if (!R.contains(event.type, [
          'message',
          'event_callback',
          'slash_command',
          'interactive_message',
        ])) {
          return Promise.resolve(null);
        }

        if (event.type === 'message' &&
            R.contains(event.subtype, [ 'channel_join', 'message_changed'])) {
              return Promise.resolve(null);
        }

        return Promise.resolve(event)
          .then((evt) => {
            // if user id exist, we get information about the user
            if (evt.user) {
              return this.user(evt.user)
                .then((userInfo) => {
                  if (userInfo) {
                    evt.user = userInfo;
                  }
                  return evt;
                });
            }
            return evt;
          })
          .then((evt: any) => {
            // if channel id exist, we get information about the channel
            if (evt.channel) {
              return this.channel(evt.channel)
                .then((channelInfo) => {
                  if (channelInfo) {
                    evt.channel = channelInfo;
                  }
                  return evt;
                });
            }
            return evt;
          })
          .then((evt) => {
            if (evt.subtype === 'bot_message') {
              evt.user = { id: evt.bot_id, is_bot: true, name: evt.username };
            }
            return evt;
          });
      })
      .mergeMap((normalized: IMessage) => this.parser.parse(normalized))
      .mergeMap((parsed) => this.parser.validate(parsed))
      .mergeMap((validated) => {
        if (!validated) { return Observable.empty(); }
        return Promise.resolve(validated);
      });
  }

  public send(data: object): Promise<object | Error> {
    this.logger.debug('sending', { message: data });

    return schemas(data, 'send')
      .then(() => data)
      .then((message) => {
        const buttons = R.filter(
          (attachment) => attachment.type === 'Button',
          <any[]> R.path(['object', 'attachment'], data) || []);

        const actions = createActions(buttons);
        const images = R.filter(
          (attachment: any) => attachment.type === 'Image',
          <any[]> R.path(['object', 'attachment'], data) || []);
        const attachments = R.map(
          (image: any) => ({ image_url: image.url, text: image.content || '', title: image.name }),
          images);

        return [message, actions, attachments];
      })
      .spread((message: any, actions: any, attachments: any) => {
        const context: any = R.path(['object', 'context'], message);
        if (context) {
          const contextArr = R.split('#', context.content);
          contextArr.shift();

          let responseURL = contextArr[0];
          if (R.length(contextArr) > 1) {
            responseURL = R.join('', contextArr);
          }

          return [message, actions, attachments, responseURL];
        }

        return [message, actions, attachments, null];
      })
      .spread((message, actions, attachments, responseURL) =>
        createSendMessage(data, message, actions, attachments, responseURL))
      .then((msg) => {
        const opts = {
          as_user: this.asUser,
          attachments: msg.attachments || [],
          unfurl_links: true,
        };

        const confirm = () => {
          if (msg.callbackID) {
            return { callbackID: msg.callbackID, serviceID: this.serviceId(), type: 'sent' };
          }

          return { serviceID: this.serviceId(), type: 'sent' };
        };

        if (msg.responseURL) {
          const options = {
            body: { attachments: opts.attachments, channel: msg.targetID, text: msg.content },
            json: true,
            method: 'POST',
            uri: msg.responseURL,
          };

          return rp(options).then(confirm);
        } else if (msg.content === '' && msg.contentID) {
          return Promise.fromCallback((cb) =>
            this.sessionWeb.chat.delete(msg.contentID, msg.targetID, cb))
            .then(confirm);
        } else if (msg.contentID) {
          return Promise.fromCallback((cb) =>
            this.sessionWeb.chat.update(msg.contentID, msg.targetID, msg.content, opts, cb))
            .then(confirm);
        } else if (!R.isEmpty(msg.content)) {
          return Promise.fromCallback((cb) =>
            this.sessionWeb.chat.postMessage(msg.targetID, msg.content, opts, cb))
            .then(confirm);
        }

        return Promise.reject(new Error('Only Note, Image, and Video are supported.'));
      });
  }

  // Return channel information
  private channel(key: string, cache: boolean = true): Promise<object> {
    if (cache && this.storeChannels.get(key)) {
      const data = this.storeChannels.get(key);
      return Promise.resolve(data);
    }

    const channel = this.session.dataStore.getChannelById(key);
    const group = this.session.dataStore.getGroupById(key);
    const dm = this.session.dataStore.getDMById(key);

    if (channel) {
      this.storeChannels.set(key, R.assoc('_is_channel', true, channel.toJSON()));
    } else if (group) {
      this.storeChannels.set(key, R.assoc('_is_group', true, group.toJSON()));
    } else if (dm) {
      this.storeChannels.set(key, R.assoc('_is_dm', true, dm.toJSON()));
    }

    if (this.storeChannels.get(key)) {
      return Promise.resolve(this.storeChannels.get(key));
    }

    const pchannel = Promise.fromCallback((done) =>
      this.sessionWeb.channels.info(key, done))
      .catch((error) => error === 'channel_not_found' ? null : { error });

    const pgroup = Promise.fromCallback((done) =>
      this.sessionWeb.groups.info(key, done))
      .catch((error) => error === 'channel_not_found' ? null : { error });

    return Promise.join(pchannel, pgroup, (chan, grp) => {
      if (!chan.error) {
        return R.assoc('_is_channel', true, chan.channel);
      } else if (!grp.error) {
        return R.assoc('_is_group', true, grp.group);
      } else if (!chan.error && !grp.error) {
        return {
          _is_dm: true,
          id: key,
        };
      }

      throw chan.error || grp.error;
    })
    .then((info) => {
      this.storeChannels.set(key, info);
      return info;
    });
  }

  // Return user information
  private user(key: string, cache: boolean = true): Promise<object> {
    if (cache && this.storeUsers.get(key)) {
      const data = this.storeUsers.get(key);
      return Promise.resolve(data);
    }

    if (this.session.dataStore.getUserById(key)) {
      const u = this.session.dataStore.getUserById(key);
      this.storeUsers.set(key, u.toJSON());
      return Promise.resolve(this.storeUsers.get(key));
    }

    return new Promise((resolve, reject) =>
      this.sessionWeb.users.info(key, (error, info) => {
        if (error || !info.ok) { return reject(error); }
        this.storeUsers.set(key, info.user);
        return resolve(info.user);
      }));
  }
}

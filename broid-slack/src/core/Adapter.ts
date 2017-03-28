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
import { CLIENT_EVENTS, RTM_EVENTS, RtmClient, WebClient } from '@slack/client';
import * as Promise from 'bluebird';
import broidSchemas from '@broid/schemas';
import { concat, Logger } from '@broid/utils';
import { EventEmitter } from 'events';
import { Router } from 'express';
import * as uuid from 'node-uuid';
import * as R from 'ramda';
import * as rp from 'request-promise';
import { Observable } from 'rxjs/Rx';

import {
  IAdapterOptions,
  IMessage,
  ISlackAction,
  ISlackMessage,
  IWebHookEvent,
} from './interfaces';
import { Parser } from './Parser';
import WebHookServer from './webHookServer.js';

export class Adapter {
  private asUser: boolean;
  private connected: boolean;
  private emitter: EventEmitter;
  private logLevel: string;
  private logger: Logger;
  private parser: Parser;
  private router: Router;
  private serviceID: string;
  private session: RtmClient;
  private sessionWeb: WebClient;
  private storeUsers: Map<string, object>;
  private storeChannels: Map<string, object>;
  private token: string | null;
  private webhookServer: WebHookServer;

  constructor(obj: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || 'info';
    this.token = obj && obj.token || null;
    this.asUser = obj && obj.asUser || true;
    this.storeUsers = new Map();
    this.storeChannels = new Map();

    this.parser = new Parser(this.serviceName(), this.serviceID, this.logLevel);
    this.logger = new Logger('adapter', this.logLevel);
    this.emitter = new EventEmitter();
    this.router = this.setupRoutes();

    if (obj.http) {
      this.webhookServer = new WebHookServer(obj.http, this.router, this.logLevel);
    }
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

  public getRouter(): Router | null {
    if (this.webhookServer) {
      return null;
    }
    return this.router;
  }

  public serviceName(): string {
    return 'slack';
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

    if (this.webhookServer) {
      this.webhookServer.listen();
    }

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
        R.forEach((user) => this.storeUsers.set(user.id, user), e.users || []);
        R.forEach((channel) => this.storeChannels.set(channel.id, channel),
          e.channels || []);
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

  public disconnect(): Promise<null> {
    this.connected = false;
    if (this.webhookServer) {
      return this.webhookServer.close();
    }

    return Promise.resolve(null);
  }

  // Listen 'message' event from Slack
  public listen(): Observable<object> {
    const rtmEvents = R.pick([
      'MESSAGE',
    ], RTM_EVENTS);

    const events = R.map((key) => Observable
      .fromEvent(this.session, rtmEvents[key]), R.keys(rtmEvents));
    const webHookEvent = Observable.fromEvent(this.emitter, 'message')
      .mergeMap((event: IWebHookEvent) => {
        const req = event.request;
        const payloadStr = R.path(['body', 'payload'], req);
        if (R.isEmpty(payloadStr)) {
          return Promise.resolve(null);
        }

        const payload = JSON.parse(payloadStr);
        let team = payload.team || {};
        if (payload.team_id) {
          team = {
            id: payload.team_id,
          };
        }

        if (payload.type === 'event_callback'
          && payload.event.type === 'message') {
            return Promise.resolve({
              channel: payload.event.channel.id,
              subtype: 'event_callback',
              team,
              text: payload.event.text,
              ts: payload.event.ts,
              type: 'message',
              user: payload.event.user.id,
            });
        } else if (payload.callback_id) { // interactive message
          return Promise.resolve({
            callback_id: payload.callback_id,
            channel: payload.channel.id,
            response_url: payload.response_url,
            subtype: 'interactive_message',
            team,
            text: payload.actions[0].value,
            ts: payload.action_ts,
            type: 'message',
            user: payload.user.id,
          });
        } else if (payload.command || payload.trigger_word) { // slash command
          return Promise.resolve({
            channel: payload.channel_id,
            subtype: 'slash_command',
            team,
            text: payload.text,
            ts: payload.action_ts,
            type: 'message',
            user: payload.user_id,
          });
        }

        return Promise.resolve({});
      });
    events.push(webHookEvent);

    return Observable.merge(...events)
      .mergeMap((event: ISlackMessage) => {
        if (!R.contains(event.type, [
          'message',
          'event_callback',
          'slash_command',
          'interactive_message',
        ])) { return Promise.resolve(null); }

        if (event.type === 'message' && R.contains(event.subtype, [
           'channel_join',
           'message_changed',
        ])) { return Promise.resolve(null); }

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
          .then((evt) => {
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
          })
          .then((evt) => {
            if (evt.subtype === 'bot_message') {
              evt.user = {
                id: evt.bot_id,
                is_bot: true,
                name: evt.username,
              };
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

  public send(data: object): Promise {
    this.logger.debug('sending', { message: data });
    return broidSchemas(data, 'send')
      .then(() => data)
      .then((message) => {
        const buttons = R.filter((attachment) => attachment.type === 'Button',
          R.path(['object', 'attachment'], data) || []);

        const actions = R.map((button) => {
          const r: ISlackAction = {
            name: button.name,
            text: button.content || button.name,
            type: 'button',
            value: button.url,
          };

          if (button.attachment) {
            r.confirm = {
              dismiss_text: R.path(['attachment', 'noLabel'], button),
              ok_text: R.path(['attachment', 'yesLabel'], button),
              text: R.path(['attachment', 'content'], button),
              title: R.path(['attachment', 'name'], button),
            };
          }
          return r;
        }, buttons);

        const images = R.filter((attachment) => attachment.type === 'Image',
          R.path(['object', 'attachment'], data) || []);

        const attachments = R.map((image) => ({
          image_url: image.url,
          text: image.content || '',
          title: image.name,
        }), images);

        return [message, actions, attachments];
      })
      .spread((message, actions, attachments) => {
        const context = R.path(['object', 'context'], message);
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
      .spread((message, actions, attachments, responseURL) => {
        const type = R.path(['object', 'type'], data);
        const name = R.path(['object', 'name'], message);
        const content = R.path(['object', 'content'], message);
        const url = R.path(['object', 'url'], message);
        const messageID = R.path(['object', 'id'], data);
        const targetID = R.path(['to', 'id'], data);
        const callbackID = uuid.v4();

        if (!R.isEmpty(actions)) {
          attachments.push({
            actions,
            callback_id: callbackID,
            fallback: 'You are unable to see interactive message',
            text: '',
          });
        }

        if (type === 'Image') {
          attachments.push({
            image_url: url,
            text: '',
            title: '',
          });

          return {
            attachments,
            callbackID,
            content: content || name || '',
            messageID,
            responseURL,
            targetID,
          };
        } else if (type === 'Video' || type === 'Note') {
          let body = content || '';
          if (type === 'Video') {
            body = concat([name, '\n', url, '\n', content]);
          }

          return {
            attachments,
            callbackID,
            content: body,
            messageID,
            responseURL,
            targetID,
          };
        }

        return {};
      })
      .then((msg) => {
        const opts = {
          as_user: this.asUser,
          attachments: msg.attachments || [],
          unfurl_links: true,
        };

        const confirm = () => {
          if (msg.callbackID) {
            return {
              callbackID: msg.callbackID,
              serviceID: this.serviceId(),
              type: 'sent',
            };
          }

          return {
            serviceID: this.serviceId(),
            type: 'sent',
          };
        };

        if (msg.responseURL) {
          const options = {
            body: {
              attachments: opts.attachments,
              channel: msg.targetID,
              text: msg.content,
            },
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
            this.sessionWeb.chat.update(msg.contentID, msg.targetID,
              msg.content, opts, cb))
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
  private channel(key: string, cache: boolean = true): Promise {
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
  private user(key: string, cache: boolean = true): Promise {
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

  // Configure API endpoints.
  private setupRoutes(): Router {
    const router = Router();

    // route handler
    router.post('/', (req, res) => {
      const event: IWebHookEvent = {
        request: req,
        response: res,
      };

      this.emitter.emit('message', event);

      // Assume all went well.
      res.send('');
    });

    return router;
  }
}

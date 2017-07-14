import schemas from '@broid/schemas';
import { Logger } from '@broid/utils';

import * as Promise from 'bluebird';
import { EventEmitter } from 'events';
import * as Gitter from 'node-gitter';
import * as R from 'ramda';
import { Observable } from 'rxjs/Rx';
import * as uuid from 'uuid';

import { IAdapterOptions } from './interfaces';
import { Parser } from './Parser';

const eventNames = ['chatMessages']; // Event availables: 'events', 'users'

// Extract only the information from room, we need
const roomToInfos = (room: any) => ({
  id: room.id,
  name: room.name,
  oneToOne: room.oneToOne,
  uri: room.uri,
  url: room.url,
});

export class Adapter {
  private ee: EventEmitter;
  private logLevel: string;
  private logger: Logger;
  private connected: boolean;
  private me: any;
  private parser: Parser;
  private serviceID: string;
  private session: any;
  private token: string | null;

  constructor(obj?: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || 'info';
    this.token = obj && obj.token || null;

    this.ee = new EventEmitter();
    this.parser = new Parser(this.serviceName(), this.serviceID, this.logLevel);
    this.logger = new Logger('adapter', this.logLevel);
  }

  // Return list of users information
  public users(): Promise<Error> {
    return Promise.reject(new Error('Not supported'));
  }

  // Return list of channels information
  // TODO: https://github.com/broidHQ/integrations/issues/114
  public channels(): Promise<any> {
    return new Promise((resolve, reject) => {
      return this.session.rooms.findAll()
        .then(resolve)
        .catch(reject);
    })
    .map(roomToInfos);
  }

  // Return the service Name of the current instance
  public serviceName(): string {
    return 'gitter';
  }

  // Return the service ID of the current instance
  public serviceId(): string {
    return this.serviceID;
  }

  public getRouter(): null {
    return null;
  }

  // Connect to Gitter
  // Start the webhook server
  public connect(): Observable<object> {
    if (!this.token || this.token === '') {
      return Observable.throw(new Error('Token should exist.'));
    }

    if (this.connected) {
      return Observable.of({ type: 'connected', serviceID: this.serviceId() });
    }

    this.session = new Gitter(this.token);
    const handler = (room, eventName) => {
      return (data) => {
        if (data.operation === 'create'
          && this.me.username !== R.path(['model', 'fromUser', 'username'], data)) {
          return this.ee.emit(eventName, {
            data: data.model,
            room: roomToInfos(room),
          });
        }
        return null;
      };
    };
    const currentUser = new Promise((resolve, reject) =>
      this.session.currentUser()
        .then(resolve)
        .catch(reject));

    const connect: Promise<any> = currentUser
      .tap((user: any) => this.me = user)
      .then(() => this.channels())
      .map((room: any) => this.joinRoom(room))
      .map((room: any) => {
        // RxJS doesn't like the event emitted that comes with node,
        // so we remake one instead.
        room.subscribe();
        R.forEach(
          (eventName) => room.on(eventName, handler(room, eventName)),
          eventNames);

        return room;
      });

    this.connected = true;
    return Observable.fromPromise(connect)
      .map(() => ({ type: 'connected', serviceID: this.serviceId() }));
  }

  public disconnect(): Promise<null> {
    this.connected = false;
    return Promise.resolve(null);
  }

  // Listen 'message' event from Google
  public listen(): Observable<object> {
    if (!this.session) {
      return Observable.throw(new Error('No session found.'));
    }

    const fromEvents =  R.map(
      (eventName) => Observable.fromEvent(this.ee, eventName),
      eventNames);

    return Observable.merge(...fromEvents)
      .mergeMap((normalized: object | null) => this.parser.parse(normalized))
      .mergeMap((parsed: object | null) => this.parser.validate(parsed))
      .mergeMap((validated: object | null) => {
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
            const roomID = R.path(['to', 'id'], result);

            return this.channels()
              .filter((room: any) => room.id === roomID)
              .then((rooms: any) => {
                if (R.length(rooms) === 0) {
                  throw new Error(`${roomID} not found.`);
                }

                return this.joinRoom(rooms[0])
                  .then((room) => [result, room]);
              });
          })
          .spread((result: any, room: any) => {
            const content = R.path(['object', 'content'], result);
            const contentID = R.path(['object', 'id'], result);

            if (contentID) {
              // Edit the message
              return this.session.client.put(
                  `${room.path}/${room.id}/chatMessages/${contentID}`,
                  {body: {text: content}});
            }

            // Create the message
            return room.send(content);
          })
          .then((response) => ({ type: 'sent', serviceID: this.serviceId(), id: response.id }));
      });
  }

  private joinRoom(room: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (room.uri) {
        return this.session.rooms.join(room.uri)
          .then(resolve)
          .catch(reject);
      } else if (room.url) {
        return this.session.rooms.join(room.url.replace(/^\/|\/$/g, ''))
          .then(resolve)
          .catch(reject);
      }
      return reject(new Error(`Cannot join room ${room.id}`));
    });
  }
}

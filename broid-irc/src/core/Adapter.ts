import {
  default as schemas,
  ISendParameters,
} from '@broid/schemas';
import { Logger } from '@broid/utils';

import * as Promise from 'bluebird';
import { EventEmitter } from 'events';
import * as irc from 'irc';
import * as uuid from 'node-uuid';
import { Observable } from 'rxjs/Rx';

import { IAdapterOptions } from './interfaces';
import { Parser } from './Parser';

export class Adapter {
  public serviceID: string;
  private connected: boolean;
  private address: string;
  private username: string;
  private ircChannels: string[];
  private client: any;
  private logLevel: string;
  private connectTimeout: number;
  private logger: Logger;
  private ee: EventEmitter;
  private parser: Parser;

  constructor(obj: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || 'info';
    this.connectTimeout = obj && obj.connectTimeout || 60000;
    this.address = obj && obj.address;
    this.username = obj && obj.username;
    this.ircChannels = obj && obj.channels;
    this.ee = new EventEmitter();

    this.parser = new Parser(this.serviceName(), this.username, this.serviceID, this.logLevel);
    this.logger = new Logger('adapter', this.logLevel);
  }

  // Return the service Name of the current instance
  public serviceName(): string {
    return 'irc';
  }

  // Return the service ID of the current instance
  public serviceId(): string {
    return this.serviceID;
  }

  public getRouter(): null {
    return null;
  }

  public users(): Promise<Error> {
    return Promise.reject(new Error('Not supported'));
  }

  public channels(): Promise<Error> {
    return Promise.reject(new Error('Not supported'));
  }

  public connect(): Observable<object> {
    if (this.connected) {
      return Observable.of({ type: 'connected', serviceID: this.serviceId() });
    }

    if (!this.address) {
      return Observable.throw(new Error('IRC address is not set'));
    }

    if (!this.username) {
      return Observable.throw(new Error('IRC username is not set'));
    }

    this.client = Promise.promisifyAll(new irc.Client(this.address, this.username, {
      autoConnect: false,
      channels: this.ircChannels,
    }));

    const connect = this.client.connectAsync()
      .catch((err) => {
        if (err.rawCommand !== '001') {
          throw err;
        }
      })
      .then(() => {
        // RxJS doesn't like the event emitted that comes with node irc,
        // so we remake one instead.
        this.client
          .addListener('message', (from, to, message) =>  // tslint:disable-line:no-reserved-keywords
            this.ee.emit('message', {from, to, message}));

        this.connected = true;
        return Observable.of({ type: 'connected', serviceID: this.serviceId() });
      });

    return Observable.fromPromise(connect)
      .timeout(this.connectTimeout);
  }

  public disconnect(): Promise<null> {
    this.connected = false;
    return this.client.disconnectAsync();
  }

  public listen(): Observable<object> {
    return Observable.fromEvent(this.ee, 'message')
      .map((normalized: object | null) => this.parser.parse(normalized))
      .map((parsed: object | null) => this.parser.validate(parsed))
      .map((validated: object | null) => {
        if (!validated) { return Observable.empty(); }
        return Promise.resolve(validated);
      });
  }

  public send(data: ISendParameters): Promise<object | Error> {
    this.logger.debug('sending', { message: data });

    return schemas(data, 'send')
      .then(() => {
        const message: string = data.object.content;
        let to: string = data.to.id;
        if (data.to.type === 'Group' && !to.includes('#')) {
          to = `#${to}`;
        }
        this.client.say(to, message);

        return { type: 'sent', serviceID: this.serviceId() };
      });
  }
}

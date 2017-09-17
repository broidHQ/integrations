import schemas from '@broid/schemas';
import { Logger } from '@broid/utils';

import * as Promise from 'bluebird';
import * as fs from 'fs';
import * as R from 'ramda';
import * as rp from 'request-promise';
import { Observable } from 'rxjs/Rx';
import * as Twitter from 'twitter';
import * as uuid from 'uuid';

import { IAdapterOptions, ITwitterSendParameters } from './interfaces';
import { Parser } from './Parser';

export class Adapter {
  private connected: boolean;
  private serviceID: string;
  private username: string | null;
  private myid: string | null;
  private token: string | null;
  private tokenSecret: string | null;
  private consumerKey: string | null;
  private consumerSecret: string | null;
  private session: any;
  private parser: Parser;
  private logLevel: string;
  private logger: Logger;
  private storeUsers: Map<string, object>;
  private sessionGET: Promise<any>;
  private sessionPOST: Promise<any>;

  constructor(obj?: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || 'info';
    this.token = obj && obj.token || null;
    this.tokenSecret = obj && obj.tokenSecret || null;
    this.consumerKey = obj && obj.consumerKey || null;
    this.consumerSecret = obj && obj.consumerSecret || null;
    this.username = obj && obj.username || null;

    this.myid = this.token && this.token.split('-')[0];
    if (this.username && !this.username.startsWith('@')) {
      this.username = `@${this.username}`;
    }

    this.parser = new Parser(this.serviceName(), this.serviceID, this.logLevel);
    this.logger = new Logger('adapter', this.logLevel);

    this.storeUsers = new Map();
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

  // Return the service Name of the current instance
  public serviceName(): string {
    return 'twitter';
  }

  public getRouter(): null {
    return null;
  }

  // Connect to Twitter
  public connect(): Observable<object> {
    if (this.connected) {
      return Observable.of({ type: 'connected', serviceID: this.serviceId() });
    }

    if (!this.token || !this.tokenSecret || !this.consumerKey || !this.consumerSecret) {
      return Observable.throw(new Error('Credentials should exist.'));
    }

    this.session = new Twitter({
      access_token_key: this.token,
      access_token_secret: this.tokenSecret,
      consumer_key: this.consumerKey,
      consumer_secret: this.consumerSecret,
    });

    this.sessionGET = Promise.promisify(this.session.get.bind(this.session));
    this.sessionPOST = Promise.promisify(this.session.post.bind(this.session));

    this.connected = true;
    return Observable.of({ type: 'connected', serviceID: this.serviceId() });
  }

  public disconnect(): Promise<null> {
    this.connected = false;
    return Promise.resolve(null);
  }

  // Listen 'message' event from Twitter
  public listen(): Observable<object> {
    const streamMention = this.session.stream('statuses/filter', { track: this.username });
    const streamDm = this.session.stream('user', { with: 'user' });

    return Observable.merge(
      Observable.fromEvent(streamDm, 'data').mergeMap((event: any) => {
        if (event.direct_message) {
          return Promise.resolve(event.direct_message);
        }
        return Promise.resolve(null);
      }),
      Observable.fromEvent(streamMention, 'data'),
    )
    .switchMap((value) => {
      return Observable.of(value)
        .mergeMap((event: any) => {
          this.logger.debug('Event received', event);

          if (!event || R.isEmpty(event)) { return Promise.resolve(null); }

          if (event.direct_message) { event = event.direct_message; }
          const authorInformation = event.user || event.sender;

          this.storeUsers.set(authorInformation.id_str, authorInformation);
          // Ignore message from me
          if (authorInformation.id_str === this.myid) {
            return Promise.resolve(null);
          }

          event._username = this.username;

          if (event.in_reply_to_user_id) {
            // mention
            return this.userById(event.in_reply_to_user_id, true)
              .then((data) => {
                event.recipient = R.assoc('is_mention', true, data);
                return event;
              });
          }

          return Promise.resolve(event);
        })
        .mergeMap((event) => this.parser.normalize(event))
        .mergeMap((normalized) => this.parser.parse(normalized))
        .mergeMap((parsed) => this.parser.validate(parsed))
        .mergeMap((validated) => {
          if (!validated) { return Observable.empty(); }
          return Promise.resolve(validated);
        })
        .catch((err) => {
          this.logger.error('Caught Error, continuing', err);
          // Return an empty Observable which gets collapsed in the output
          return Observable.of(err);
        });
    })
    .mergeMap((value) => {
      if (value instanceof Error) {
        return Observable.empty();
      }
      return Promise.resolve(value);
    });
  }

  public send(data: object): Promise<object | null> {
    this.logger.debug('sending', { message: data });

    return schemas(data, 'send')
      .then(() => {
        const name: string = R.path(['object', 'name'], data) as string;
        const content: string = R.path(['object', 'content'], data) as string;
        const dataType: string = R.path(['object', 'type'], data) as string;
        const toID: string = R.path(['to', 'id'], data) as string;
        const options: any = {
          content,
          screen_name: '',
          to_channel: !(R.path(['to', 'type'], data) === 'Person'),
          twit_options: { retry: true },
          user_id: null,
        };

        let job: Promise<any> = Promise.resolve(null);
        if (!toID.startsWith('@') && !isNaN(Number(toID.charAt(0)))) {
          options.user_id = toID;

          if (options.to_channel) {
            // Get the username for mention
            job = this.userById(toID, true)
              .then((user) => {
                options.screen_name = `@${user.screen_name}`;
                return options;
              });
          } else {
            job = Promise.resolve(options);
          }
        } else {
          options.screen_name = toID;
          job = Promise.resolve(options);
        }

        return job.then((opts: any) => {
          if (!opts) {
            throw new Error('Only Note, Image, and Video are supported.');
          }

          if (dataType === 'Image' || dataType === 'Video') {
            if (opts.to_channel) {
              return [
                opts,
                this.createMedia(R.path(['object', 'url'], data) as string, name),
              ];
            }

            opts.content = `${opts.content} ${R.path(['object', 'url'], data)}`;
          }

          return [opts, null];
        })
        .spread((opts: any, mediaIDs: any[]) => {
          let path = 'statuses/update';

          const params: ITwitterSendParameters = {
            twit_options: opts.twit_options,
          };

          if (!opts.to_channel) {
            path = 'direct_messages/new';
            params.text = opts.content;

            if (opts.screen_name) {
              params.screen_name = opts.screen_name;
            } else {
              params.user_id = opts.user_id;
            }
          } else {
            params.status = `${opts.screen_name}: ${opts.content}`;
          }

          if (mediaIDs) {
            params.media_ids = R.values(mediaIDs);
          }

          return this.sessionPOST(path, params)
            .then(() => ({ type: 'sent', serviceID: this.serviceId() }));
        });
      });
  }

  // Get the user information from the platform
   // Ask the memory cache before make a external call
  private userById(key: string, cache: boolean = true): Promise<object> {
    if (cache) {
      const data = this.storeUsers.get(key);
      if (data) {
        return Promise.resolve(data);
      }
    }

    return this.sessionGET('users/show', { user_id: key })
      .then((data) => {
        this.storeUsers.set(key, data);
        return data;
      });
  }

  // Twitter need some steps to update a Image or Videp
  private createMedia(url: string, altText: string = ''): Promise<string> {
    let stream = Promise.resolve(null);
    if (url.startsWith('http://') || url.startsWith('https://')) {
      stream = rp(url, { encoding: null })
        .then((body) => new Buffer(body).toString('base64'));
    } else {
      stream = Promise.resolve(fs.readFileSync(url, { encoding: 'base64' }));
    }

    return stream
      .then((b64) => {
        if (b64) { return b64; }
        throw new Error('URL should a absolute path or http url.');
      })
      .then((b64) => this.sessionPOST('media/upload', { media_data: b64 }))
        .then((data) => {
          const mediaID = data.media_id_string;
          return this.sessionPOST(
            'media/metadata/create',
            { media_id: mediaID, altText: { text: altText } })
            .then(() => ({ mediaID }));
        });
  }
}

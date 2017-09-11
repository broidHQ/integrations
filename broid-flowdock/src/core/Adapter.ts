import schemas from '@broid/schemas';
import { Logger } from '@broid/utils';

import * as Promise from 'bluebird';
import * as flowdock from 'flowdock';
import * as R from 'ramda';
import { Observable } from 'rxjs/Rx';
import * as uuid from 'uuid';

import { IAdapterOptions } from './interfaces';
import { Parser } from './Parser';

// Promisify the Flowdock Client
const makeRequest = (session, method, ...args) =>
  new Promise((resolve, reject) =>
    session[method](...args, (err, body) =>
      err ? reject(err) : resolve(body)));

export class Adapter {
  private connected: boolean;
  private serviceID: string;
  private token: string | null;
  private session: any;
  private parser: Parser;
  private logLevel: string;
  private logger: Logger;
  private storeUsers: Map<string, any>;
  private storeFlows: Map<string, any>;

  constructor(obj?: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || 'info';
    this.token = obj && obj.token || null;

    this.parser = new Parser(this.serviceName(), this.serviceID, this.logLevel);
    this.logger = new Logger('adapter', this.logLevel);

    this.storeUsers = new Map();
    this.storeFlows = new Map();
  }

  // Return list of users information
  public users(): Promise<Map<string, any>> {
    return Promise.resolve(this.storeUsers);
  }

  // Return list of channels information
  public channels(): Promise<Map<string, any>> {
    return Promise.resolve(this.storeFlows);
  }

  // Return the service ID of the current instance
  public serviceId(): string {
    return this.serviceID;
  }

  // Return the service Name of the current instance
  public serviceName(): string {
    return 'flowdock';
  }

  public getRouter(): null {
    return null;
  }

  // Connect to Flowdock
  public connect(): Observable<object> {
    if (!this.token) {
      return Observable.throw(new Error('Credentials should exist.'));
    }

    if (this.connected) {
      return Observable.of({ type: 'connected', serviceID: this.serviceId() });
    }

    this.connected = true;
    this.session = new flowdock.Session(this.token);

    return Observable.of({ type: 'connected', serviceID: this.serviceId() });
  }

  public disconnect(): Promise<null> {
    this.connected = false;
    return Promise.resolve(null);
  }

  // Listen 'message' event from Flowdock
  public listen(): Observable<object> {
    const getFlows = new Promise((resolve, reject) => {
        this.session.flows((err, flows) => {
          if (err) { return reject(err); }
          return resolve(flows);
        });
    });

    return Observable.fromPromise(getFlows)
      .switchMap((value) => {
        return Observable.of(value)
         .mergeMap((flows: any) => {
            const users = R.flatten(R.map((flow: any) => flow.users, flows));

            R.forEach((user: any) => this.storeUsers.set(user.id.toString(), user), users);
            R.forEach(
              (flow: any) => this.storeFlows.set(flow.id.toString(), R.dissoc('users', flow)),
              flows);

            return Promise.resolve(R.map((flow: any) => flow.id.toString(), flows));
          })
          .mergeMap((flowIDs: string[]) => {
            const streams = R.map((flowID) => this.session.stream(flowID, { user: 1 }), flowIDs);
            const obs =  R.map((stream) => Observable.fromEvent(stream, 'message'), streams);
            return Observable.merge(...obs);
          })
          .mergeMap((event: any) => {
            this.logger.debug('Event received', event);
            if (event.event !== 'message' && event.event !== 'message-edit') {
              return Observable.empty();
            }

            // private message
            if (!event.flow) {
              return this.userByID(event.user)
                .then((userFrom) => {
                  event.flow = userFrom;
                  event.user = userFrom;
                  event._isPrivate = true;
                  return event;
                });
            }

            // Public event
            return this.flowByID(event.flow)
              .then((flow) => {
                return this.userByID(event.user)
                  .then((user) => {
                    event.flow = flow;
                    event.user = user;
                    return event;
                  });
              });
          })
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

  public send(data: any): Promise<object | Error> {
    this.logger.debug('sending', { message: data });

    return schemas(data, 'send')
      .then(() => {
        if (R.path(['object', 'type'], data) !== 'Note') {
          return Promise.reject(new Error('Only Note is supported.'));
        }

        return Promise.resolve(data)
          .then((result) => {
            const dataType = data.type;
            const flowID = R.path(['to', 'id'], result);
            const toType = R.path(['to', 'type'], result);
            const content = R.path(['object', 'content'], result);
            const contentID = R.path(['object', 'id'], result);
            const tags = R.map(
              (tag: any) => tag.name,
              R.path(['object', 'tag'], result) as any[] || []);
            const context: any = R.path(['object', 'context'], result);

            if (context && context.content) { // Send a message on thread
              return Promise.fromCallback((cb) => this.session
                .threadMessage(flowID, context.content, content, tags, cb));
            } else if (toType === 'Group' && (dataType === 'Update' || dataType === 'Delete')) {
              // EDIT message, only Public message
              return this.flowByID(flowID as string)
                .then((flow) =>
                  Promise.fromCallback((cb) => this.session
                    .editMessage(
                      flow.parameterized_name,
                      R.path(['organization', 'parameterized_name'], flow),
                      Number(contentID), { content, tags }, cb)));
            } else if (toType === 'Person') { // Private Message
              return this.userByID(flowID as string)
                .tap(console.log)
                .then((user) =>
                  Promise.fromCallback((cb) => this.session
                    .privateMessage(user.id, content, tags, cb)));
            }

            return Promise.fromCallback((cb) => this.session
              .message(flowID, content, tags, cb));
          });
      })
      .then(({ type: 'sent', serviceID: this.serviceId() }));
  }

  private userByID(userID: string): Promise<any> {
    return Promise.resolve(this.storeUsers.get(userID))
      .then((user) => {
        if (!user) {
          // User is not saved in the store, so we will ask the info with
          // API call
          return makeRequest(this.session, 'users', { id: userID })
            .then((body: any) => {
              this.storeUsers.set(body.id.toString(), body);
              return body;
            });
        }

        return user;
      });
  }

  private flowByID(flowID: string): Promise<any> {
    return Promise.resolve(this.storeFlows.get(flowID))
      .then((flow) => {
        if (!flow) {
          // Flow is not saved in the store, so we will ask the info with
          // API call
          return makeRequest(this.session, '/flows/find', { id: flowID })
            .then((body: any) => {
              R.forEach(
                (user: any) => this.storeUsers.set(user.id.toString(), user),
                body.users);

              this.storeFlows.set(body.id.toString(), R.dissoc('users', body));

              return body;
            });
        }

        return flow;
      });
  }
}

import schemas, { ISendParameters } from '@broid/schemas';
import { Logger } from '@broid/utils';

import * as Promise from 'bluebird';
import * as crypto from 'crypto';
import { EventEmitter } from 'events';
import { Router } from 'express';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as R from 'ramda';
import * as request from 'request';
import { Observable } from 'rxjs/Rx';
import * as tmp from 'tmp';
import * as uuid from 'uuid';
import * as WeChat from 'wechat-api';

import { IAdapterOptions } from './interfaces';
import { Parser } from './Parser';
import { WebHookServer } from './WebHookServer';

export class Adapter {
  public serviceID: string;
  private appID: string;
  private appSecret: string;
  private client: any;
  private connected: boolean;
  private emitter: EventEmitter;
  private logLevel: string;
  private logger: Logger;
  private parser: Parser;
  private router: Router;
  private webhookServer: WebHookServer;

  constructor(obj: IAdapterOptions) {
    this.serviceID = obj && obj.serviceID || uuid.v4();
    this.logLevel = obj && obj.logLevel || 'info';
    this.appID = obj && obj.appID;
    this.appSecret = obj && obj.appSecret;

    this.emitter = new EventEmitter();
    this.logger = new Logger('adapter', this.logLevel);

    if (!this.appID) {
      throw new Error('appID must be set');
    }
    if (!this.appSecret) {
      throw new Error('appSecret must be set');
    }

    this.client = Promise.promisifyAll(new WeChat(this.appID, this.appSecret));
    this.parser = new Parser(this.serviceName(), this.client, this.serviceID, this.logLevel);
    this.router = this.setupRouter();

    if (obj.http) {
      this.webhookServer = new WebHookServer(obj.http, this.router, this.logLevel);
    }
  }

  // Return the service ID of the current instance
  public serviceId(): string {
    return this.serviceID;
  }

  public serviceName(): string {
    return 'wechat';
  }

  public connect(): Observable<object> {
    if (this.connected) {
      return Observable.of({ type: 'connected', serviceID: this.serviceId() });
    }

    if (this.webhookServer) {
      this.webhookServer.listen();
    }

    this.connected = true;
    return Observable.of(({ type: 'connected', serviceID: this.serviceId() }));
  }

  public disconnect(): Promise<null> {
    this.connected = false;
    if (this.webhookServer) {
      return this.webhookServer.close();
    }

    return Promise.resolve(null);
  }

  public listen(): Observable<object> {
    if (!this.webhookServer) {
      return Observable.throw(new Error('No webhookServer found.'));
    }

    return Observable.fromEvent(this.emitter, 'message')
      .mergeMap((event: object) => this.parser.parse(event))
      .mergeMap((parsed: object | null) => this.parser.validate(parsed))
      .mergeMap((validated: object | null) => {
        if (!validated) { return Observable.empty(); }
        return Promise.resolve(validated);
      });
  }

  // TODO: https://github.com/broidHQ/integrations/issues/114
  public users(): Promise<any | Error> {
    return this.client.getFollowersAsync()
      .then((res) => this.client.batchGetUsersAsync(res.data.openid))
      .then(R.prop('user_info_list'));
  }

  public getRouter(): Router | null {
    if (this.webhookServer) {
      return null;
    }
    return this.router;
  }

  public send(data: ISendParameters): Promise<object | Error> {
    this.logger.debug('sending', { message: data });

    return schemas(data, 'send')
      .then(() => {
        switch (data.object.type) {
          case 'Note':
            return this.client.sendTextAsync(data.to.id, data.object.content);
          case 'Audio':
            return this.uploadFile(data.object.url, 'voice', data.object.name || 'audio.amr')
              .then((mediaID) => {
                return this.client.sendVoiceAsync(data.to.id, mediaID);
              });
          case 'Image':
            return this.uploadFile(data.object.url, 'image', data.object.name || 'image.jpg')
              .then((mediaID) => {
                return this.client.sendImageAsync(data.to.id, mediaID);
              });
          case 'Video':
            return this.uploadFile(data.object.url, 'video', data.object.name || 'video.mp4')
              .then((mediaID) => {
                return this.client.sendVideoAsync(data.to.id, mediaID);
              });
          default:
            throw new Error(`${data.object.type} not supported.`);
        }
      })
      .then(() => ({ type: 'sent', serviceID: this.serviceId() }));
  }

  private uploadFile(url: string, fType: string, file: string): Promise<string> {
    const tmpdir: string = tmp.dirSync().name;
    const filePath: string = path.join(tmpdir, file);
    const fileStream = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
      request(url)
        .pipe(fileStream)
        .on('error', (err) => {
          reject(err);
        })
        .on('close', () => {
          fileStream.close();
          resolve();
        });
    })
    .then(() => this.client.uploadMediaAsync(filePath, fType))
    .then((res) => {
      fs.removeSync(tmpdir);
      if (res.errcode) {
        throw new Error(res);
      }
      return res.media_id;
    });
  }

  private setupRouter(): Router {
    const router = Router();

    router.get('/', (req, res) => {
      const shasum = crypto.createHash('sha1');
      shasum.update([this.serviceID, req.query.timestamp, req.query.nonce].sort().join(''));
      const signature = shasum.digest('hex');

      if (signature !== req.query.signature) {
        return res.status(500).end();
      }
      res.status(200).send(req.query.echostr);
    });

    router.post('/', (req, res) => {
      this.emitter.emit('message', req.body.xml);
      res.status(200).end();
    });

    return router;
  }
}

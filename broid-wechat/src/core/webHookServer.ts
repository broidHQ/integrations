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

import { Logger } from '@broid/utils';

import * as Promise from 'bluebird';
import * as bodyParser from 'body-parser';
import * as crypto from 'crypto';
import { EventEmitter } from 'events';
import * as express from 'express';
import * as xmlParser from 'express-xml-bodyparser';
import * as http from 'http';

import { IAdapterHTTPOptions } from './interfaces';

export class WebHookServer extends EventEmitter {
  private express: express.Application;
  private host: string;
  private httpClient: http.Server;
  private logger: Logger;
  private port: number;
  private router: express.Router;
  private serviceID: string;

  // Run configuration methods on the Express instance.
  constructor(serviceID: string, options: IAdapterHTTPOptions, logLevel: string) {
    super();
    this.host = options.host;
    this.port = options.port;
    this.serviceID = serviceID;
    this.logger = new Logger('webhook_server', logLevel);

    this.setupExpress();
  }

  public listen() {
    this.httpClient = this.express.listen(this.port, this.host, () => {
      this.logger.info(`Server listening on port ${this.host}:${this.port}...`);
    });
  }

  public close(): Promise<null> {
    return Promise.fromCallback((cb) => this.httpClient.close(cb));
  }

  private setupExpress() {
    this.express = express();
    this.router = express.Router();
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use(xmlParser());

    this.router.get('/', (req, res) => {
      const shasum = crypto.createHash('sha1');
      shasum.update([this.serviceID, req.query.timestamp, req.query.nonce].sort().join(''));
      const signature = shasum.digest('hex');

      if (signature !== req.query.signature) {
        return res.status(500).end();
      }
      res.status(200).send(req.query.echostr);
    });

    this.router.post('/', (req, res) => {
      this.emit('message', req.body.xml);
      res.status(200).end();
    });

    this.express.use(this.router);
  }
 }

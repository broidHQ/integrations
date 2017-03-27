<<<<<<< HEAD
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
import * as express from 'express';
import * as http from 'http';

import { IAdapterHTTPOptions } from './interfaces';

export class WebHookServer {
  private express: express.Application;
  private logger: Logger;
  private httpClient: http.Server;
  private host: string;
  private port: number;

  // Run configuration methods on the Express instance.
  constructor(options: IAdapterHTTPOptions, router: express.Router, logLevel?: string) {
    this.host = options.host;
    this.port = options.port;
    this.logger = new Logger('webhook_server', logLevel || 'info');
    this.setupExpress(router);
  }

  public listen() {
    this.httpClient = this.express.listen(this.port, this.host, () => {
      this.logger.info(`Server listening on port ${this.host}:${this.port}...`);
    });
  }

  public close(): Promise<null> {
    return Promise.fromCallback((cb) => this.httpClient.close(cb));
  }

  // Configure API endpoints.
  private setupExpress(router: express.Router) {
    this.express = express();
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use('/', router);
  }
}

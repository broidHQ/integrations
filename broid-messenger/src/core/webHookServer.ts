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

import * as bodyParser from 'body-parser';
import { EventEmitter } from 'events';
import * as express from 'express';

import { IAdapterHTTPOptions, IWebHookEvent } from './interfaces';

export class WebHookServer extends EventEmitter {
  private express: express.Application;
  private logger: Logger;
  private tokenSecret: string;
  private host: string;
  private port: number;

  // Run configuration methods on the Express instance.
  constructor(tokenSecret: string, options?: IAdapterHTTPOptions, logLevel?: string) {
    super();
    this.host = options && options.host || '127.0.0.1';
    this.port = options && options.port || 8080;
    this.tokenSecret = tokenSecret || '';
    this.logger = new Logger('webhook_server', logLevel || 'info');
    this.express = express();
    this.middleware();
    this.routes();
  }

  public listen() {
    this.express.listen(this.port, this.host, () => {
      this.logger.info(`Server listening at port ${this.host}:${this.port}...`);
    });
  }

  // Configure Express middleware.
  private middleware(): void {
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
  }

  // Configure API endpoints.
  private routes(): void {
    const router = express.Router();

    // Endpoint to verify the trust
    router.get('/', (req, res) => {
      if (req.query['hub.mode'] === 'subscribe') {
        if (req.query['hub.verify_token'] === this.tokenSecret) {
          res.send(req.query['hub.challenge']);
        } else {
          res.send('OK');
        }
      }
    });

    // route handler
    router.post('/', (req, res) => {
      const event: IWebHookEvent = {
        request: req,
        response: res,
      };

      this.emit('message', event);

      // Assume all went well.
      res.sendStatus(200);
    });

    this.express.use('/', router);
  }
}

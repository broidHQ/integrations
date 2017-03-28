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
import * as http from 'http';

import { IAdapterHTTPOptions } from './interfaces';

export class WebHookServer {
  private logger: Logger;
  private host: string;
  private port: number;

  // Run configuration methods on the Express instance.
  constructor(options?: IAdapterHTTPOptions, logLevel?: string) {
    this.host = options && options.host || '127.0.0.1';
    this.port = options && options.port || 8080;
    this.logger = new Logger('webhook_server', logLevel || 'info');
  }

  public listen(handler: any) {
    http.createServer(handler)
      .listen(this.port, this.host, () => {
        this.logger.info(`Server listening at port ${this.host}:${this.port}...`);
      });
  }
}

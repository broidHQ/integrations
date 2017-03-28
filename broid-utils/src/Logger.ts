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

import * as pino from 'pino';

export default class Logger { // tslint:disable-line:no-default-export
  private pino: any;

  constructor(name: string, level: string) {
    this.pino = pino({
      level,
      name,
    });
  }

  public error(...messages: any[]) {
    messages.map((message: any) => this.pino.error(message));
  }

  public warning(...messages: any[]) {
    messages.map((message: any) => this.pino.warn(message));
  }

  public info(...messages: any[]) {
    messages.map((message: any) => this.pino.info(message));
  }

  public debug(...messages: any[]) {
    messages.map((message: any) => this.pino.debug(message));
  }
}

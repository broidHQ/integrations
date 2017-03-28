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
export interface IAdapterHTTPOptions {
  host: string;
  port: number;
}

export interface IAdapterOptions {
  logLevel: string;
  http: IAdapterHTTPOptions;
  serviceID: string;
  token: string;
  tokenSecret: string;
  username: string;
}

export interface IActivityStream {
  actor?: {};
  object?: ITwilioActivityStreamObject;
  target?: {};
  readonly '@context': string;
  readonly generator: {};
  readonly published: number;
  readonly type: string;
}

export interface ITwilioWebHookEvent {
  response: any;
  request: any;
}

export interface ITwilioActivityStreamObject {
  id: string;
  content?: string;
  mediaType?: string;
  type: string;
  url?: string;
  attachment?: ITwilioMedia;
}

export interface ITwilioMedia {
  mediaType: string;
  type: string;
  url: string;
}

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
  webhookURL: string;
}

export interface IAdapterOptions {
  logLevel: string;
  http: IAdapterHTTPOptions;
  serviceID: string;
  token: string;
}

export interface IActivityStream {
  actor?: {};
  object?: IActivityStreamObject;
  target?: {};
  readonly '@context': string;
  readonly generator: {};
  readonly published: number;
  readonly type: string;
}

export interface IActivityStreamObject {
  attachment?: IMediaObject | IMediaObject[] | null;
  content?: string;
  context?: IContextObject;
  id: string;
  mediaType?: string;
  name?: string;
  preview?: string;
  type: string;
  url?: string;
}

export interface IContextObject {
  content: string;
  name: string;
  type: string;
}

export interface IMediaObject {
  content?: string;
  mediaType?: string;
  name?: string;
  preview?: string;
  type: string;
  url: string;
}

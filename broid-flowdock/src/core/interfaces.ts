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
export interface IAdapterOptions {
  token: string;
  serviceID: string;
  logLevel: string;
}

export interface IActivityStream {
  actor?: IActivityActor;
  cc?: IActivityActor[];
  object?: IActivityStreamObject;
  target?: IActivityActor;
  readonly '@context': string;
  readonly generator: {};
  readonly published: number;
  readonly type: string;
}

export interface IActivityStreamObject {
  id: string;
  content?: string;
  context?: IActivityContext;
  name?: string;
  tag?: IActivityTag[];
  type: string;
}

export interface IActivityContext {
  content: string;
  name: string;
  type: string;
}

export interface IActivityActor {
  id: string;
  name: string;
  type: string;
}

export interface IActivityTag {
  id: string;
  name: string;
  type: string;
}

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

export interface IUserInformations {
  readonly id: string;
  readonly username: string;
  readonly is_bot: boolean;
  readonly avatar: string;
}

export interface IChannelInformations {
  readonly guildID: string;
  readonly id: string;
  readonly name: string;
  readonly topic: string;
}

export interface IActivityStream {
  readonly '@context': string;
  readonly published: number;
  readonly type: string;
  readonly generator: any;
  actor?: any;
  target?: any;
  object?: any;
}

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
  asUser: boolean;
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

export interface IWebHookEvent {
  response: any;
  request: any;
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

export interface IMessage {
  type: string;
  channel: ISlackGroup | ISlackDirectMessage | ISlackChannel;
  user: ISlackUser;
  text: string;
  ts: string;
}

// Slack Interface
interface ISlackField {
  value: string;
  alt: string;
}

interface ISlackProfile {
  first_name: string;
  last_name: string;
  avatar_hash: string;
  real_name: string;
  real_name_normalized: string;
  email: string;
  image_24: string;
  image_32: string;
  image_48: string;
  image_72: string;
  image_192: string;
  image_512: string;
  fields: { [name: string]: ISlackField };
}

interface ISlackUser {
  id: string;
  team_id: string;
  name: string;
  deleted: boolean;
  color: string;
  real_name: string;
  tz: string;
  tz_label: string;
  tz_offset: number;
  profile: ISlackProfile;
  is_admin: boolean;
  is_owner: boolean;
  is_primary_owner: boolean;
  is_restricted: boolean;
  is_ultra_restricted: boolean;
  is_bot: boolean;
  presence: string;
}

interface ISlackChannel {
  id: string;
  name: string;
  is_channel: boolean;
  created: 1426851129;
  creator: string;
  is_archived: boolean;
  is_general: boolean;
  has_pins: boolean;
  is_member: boolean;
}

interface ISlackDirectMessage {
  id: string;
  user: string;
  created: number;
  is_im: boolean;
  is_org_shared: boolean;
  has_pins: boolean;
  last_read: string;
  latest: ISlackMessage;
  unread_count: number;
  unread_count_display: number;
  is_open: boolean;
}

interface ISlackGroup {
  id: string;
  name: string;
  is_group: boolean;
  created: number;
  creator: string;
  is_archived: boolean;
  is_mpim: boolean;
  has_pins: boolean;
  is_open: boolean;
  last_read: string;
  latest: ISlackMessage;
  unread_count: number;
  unread_count_display: number;
  members: string[];
  topic: {
    value: string;
    creator: string;
    last_set: number;
  };
  purpose: {
    value: string;
    creator: string;
    last_set: number;
  };
}

export interface ISlackMessage {
  type: string;
  subtype?: string;
  file?: any;
  channel: string;
  user: string;
  text: string;
  ts: string;
}

export interface ISlackAction {
  confirm?: any;
  name: string;
  text: string;
  type: string;
  value: string;
}

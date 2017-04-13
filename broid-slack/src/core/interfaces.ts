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

export interface IWebHookEvent {
  response: any;
  request: any;
}

export interface IMessage {
  type: string; // tslint:disable-line:no-reserved-keywords
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
  type: string; // tslint:disable-line:no-reserved-keywords
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
  type: string; // tslint:disable-line:no-reserved-keywords
  value: string;
}

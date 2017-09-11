export interface IAdapterHTTPOptions {
  host: string;
  port: number;
}

export interface IAdapterOptions {
  http?: IAdapterHTTPOptions;
  logLevel?: string;
  serviceID?: string;
  token: string;
  tokenSecret: string;
  username: string;
}

export interface IAttachment {
  type: string; // tslint:disable-line:no-reserved-keywords
  url?: string;
  lat?: string;
  lng?: string;
  name?: string;
  token: string;
  placeholder?: string;
  charmap?: number[][];
}

export interface IMessageParams {
  text: string;
  attachments: IAttachment[];
}

export interface IMessage extends IMessageParams {
  id: string;
  source_guid: string;
  sender_id: string;
  sender_type: string;
  created_at: number;
  user_id: string;
  group_id: string;
  name: string;
  avatar_url: string;
  system: boolean;
  favorited_by: string[];
  recipient_id?: string;
}

export interface IMemberParsed {
  avatar: string;
  id: string;
  username: string;
}

export interface IGroupParsed {
  created_at: number;
  id: string;
  name: string;
  members: IMemberParsed[];
  updated_at: number;
  type: string; // tslint:disable-line:no-reserved-keywords

}

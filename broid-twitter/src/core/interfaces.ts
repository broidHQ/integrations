export interface IAdapterOptions {
  token: string;
  tokenSecret: string;
  consumerSecret: string;
  consumerKey: string;
  username: string;
  serviceID: string;
  logLevel: string;
}

export interface IActivityStream {
  readonly "@context": string;
  readonly published: number;
  readonly type: string;
  readonly generator: {};
  actor: {};
  target: {};
  object?: IActivityObject;
}

export interface IActivityObject {
  id: string;
  content?: string;
  context?: IActivityContext;
  mediaType?: string;
  name?: string;
  tag?: IActivityTag[];
  type: string;
  url?: string;
}

export interface IActivityContext {
  content: string;
  name: string;
  type: string;
}

export interface IActivityTag {
  id: string;
  name: string;
  type: string;
}

export interface ISendParameters {
  status?: string;
  twit_options: Object;
  text?: string;
  screen_name?: string;
  user_id?: string;
  media_ids?: Object[];
}

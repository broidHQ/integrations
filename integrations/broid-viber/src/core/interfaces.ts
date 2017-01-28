export interface IAdapterHTTPOptions {
  host: string;
  port: number;
  webhookURL: string;
}

export interface IAdapterOptions {
  avatar: string;
  http: IAdapterHTTPOptions;
  logLevel: string;
  serviceID: string;
  token: string;
  tokenSecret: string;
  username: string;
}

export interface IActivityStream {
  readonly "@context": string;
  actor: {};
  object: IActivityObject;
  readonly published: number;
  readonly generator: {};
  target: {};
  readonly type: string;
}

export interface IActivityObject {
  content?: string;
  id?: string;
  latitude?: number;
  longitude?: number;
  mediaType?: string;
  type?: string;
  url?: string;
}

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
}

export interface IActivityStream {
  actor?: {};
  object?: IActivityStreamObject;
  target?: {};
  readonly "@context": string;
  readonly generator: {};
  readonly published: number;
  readonly type: string;
}

export interface IWebHookEvent {
  response: any;
  request: any;
}

export interface IActivityStreamObject {
  id: string;
  content?: string;
  mediaType?: string;
  type: string;
  url?: string;
  attachment?: IMediaObject[];
}

export interface IMediaObject {
  mediaType?: string;
  type: string;
  url: string;
}

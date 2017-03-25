export interface IAdapterHTTPOptions {
  host: string;
  port: number;
}

export interface IAdapterOptions {
  logLevel: string;
  http?: IAdapterHTTPOptions;
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
  context?: IContextObject;
  id?: string;
  mediaType?: string;
  name?: string;
  preview?: string;
  type: string;
  url: string;
}

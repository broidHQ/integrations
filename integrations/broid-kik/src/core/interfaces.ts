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
  username: string;
}

export interface IActivityStream {
  actor: {};
  object: {};
  target: {};
  readonly "@context": string;
  readonly published: number;
  readonly type: string;
  readonly generator: {};
}

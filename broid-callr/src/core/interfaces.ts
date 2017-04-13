export interface IAdapterHTTPOptions {
  host: string;
  port: number;
}

export interface IAdapterOptions {
  logLevel: string;
  serviceID: string;
  token: string;
  tokenSecret: string;
  username: string;
  webhookURL: string;
  http?: IAdapterHTTPOptions;
}

export interface ICallrWebHookEvent {
  request: any;
  response: any;
}

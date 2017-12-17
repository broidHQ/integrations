export interface IAdapterHTTPOptions {
  host: string;
  port: number;
}

export interface IAdapterOptions {
  token: string;
  tokenSecret: string;
  logLevel?: string;
  http?: IAdapterHTTPOptions;
  serviceID?: string;
  username?: string;
}

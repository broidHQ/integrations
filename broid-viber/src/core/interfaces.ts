export interface IAdapterHTTPOptions {
  host: string;
  port: number;
}

export interface IAdapterOptions {
  avatar: string;
  http: IAdapterHTTPOptions;
  logLevel: string;
  serviceID: string;
  token: string;
  tokenSecret: string;
  username: string;
  webhookURL: string;
}

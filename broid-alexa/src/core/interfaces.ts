export interface IAdapterHTTPOptions {
  host: string;
  port: number;
}

export interface IAdapterOptions {
  http: IAdapterHTTPOptions;
  logLevel: string;
  serviceID: string;
}

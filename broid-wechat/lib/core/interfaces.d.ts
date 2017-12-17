export interface IAdapterHTTPOptions {
    host: string;
    port: number;
}
export interface IAdapterOptions {
    appID: string;
    appSecret: string;
    serviceID?: string;
    logLevel?: string;
    http?: IAdapterHTTPOptions;
}

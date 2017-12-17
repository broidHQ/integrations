export interface IAdapterHTTPOptions {
    host: string;
    port: number;
}
export interface IAdapterOptions {
    token: string;
    webhookURL: string;
    logLevel?: string;
    http?: IAdapterHTTPOptions;
    serviceID?: string;
    username?: string;
}

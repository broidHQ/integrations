export interface IAdapterHTTPOptions {
    host: string;
    port: number;
}
export interface IAdapterOptions {
    token: string;
    tokenSecret: string;
    username: string;
    webhookURL: string;
    avatar: string;
    http?: IAdapterHTTPOptions;
    logLevel?: string;
    serviceID?: string;
}

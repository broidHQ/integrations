export interface IAdapterHTTPOptions {
    host: string;
    port: number;
}
export interface IAdapterOptions {
    logLevel?: string;
    http?: IAdapterHTTPOptions;
    serviceID?: string;
    token: string;
    tokenSecret: string;
}
export interface IWebHookEvent {
    response: any;
    request: any;
}

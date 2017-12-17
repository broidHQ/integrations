export interface IAdapterHTTPOptions {
    host: string;
    port: number;
}
export interface IAdapterOptions {
    token: string;
    tokenSecret: string;
    webhookURL: string;
    logLevel?: string;
    username?: string;
    serviceID?: string;
    http?: IAdapterHTTPOptions;
}
export interface ICallrWebHookEvent {
    request: any;
    response: any;
}

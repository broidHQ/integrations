/// <reference types="bluebird" />
import { ISendParameters } from '@broid/schemas';
import * as Promise from 'bluebird';
import { Observable } from 'rxjs/Rx';
import { IAdapterOptions } from './interfaces';
export declare class Adapter {
    serviceID: string;
    private connected;
    private address;
    private username;
    private ircChannels;
    private client;
    private logLevel;
    private connectTimeout;
    private logger;
    private ee;
    private parser;
    constructor(obj: IAdapterOptions);
    serviceName(): string;
    serviceId(): string;
    getRouter(): null;
    users(): Promise<Error>;
    channels(): Promise<Error>;
    connect(): Observable<object>;
    disconnect(): Promise<null>;
    listen(): Observable<object>;
    send(data: ISendParameters): Promise<object | Error>;
}

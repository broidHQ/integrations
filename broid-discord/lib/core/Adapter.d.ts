/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import { Observable } from 'rxjs/Rx';
import { IAdapterOptions } from './interfaces';
export declare class Adapter {
    serviceID: string;
    token: string | null;
    private connected;
    private session;
    private parser;
    private logLevel;
    private logger;
    constructor(obj?: IAdapterOptions);
    users(): Promise<any>;
    channels(): Promise<any>;
    serviceId(): string;
    serviceName(): string;
    getRouter(): null;
    connect(): Observable<any>;
    disconnect(): Promise<null>;
    listen(): Observable<any>;
    send(data: object): Promise<object | Error>;
}

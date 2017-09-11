/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import { Observable } from 'rxjs/Rx';
import { IAdapterOptions } from './interfaces';
export declare class Adapter {
    private connected;
    private logLevel;
    private logger;
    private parser;
    private router;
    private serviceID;
    private session;
    private storeUsers;
    private token;
    private tokenSecret;
    private username;
    private webhookServer;
    constructor(obj: IAdapterOptions);
    users(): Promise<Map<string, object>>;
    channels(): Promise<Error>;
    serviceName(): string;
    serviceId(): string;
    getRouter(): null;
    connect(): Observable<object>;
    disconnect(): Promise<null>;
    listen(): Observable<object>;
    send(data: object): Promise<object | Error>;
    private user(key, cache?);
}

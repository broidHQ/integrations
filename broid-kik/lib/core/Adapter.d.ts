/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import { Router } from 'express';
import { Observable } from 'rxjs/Rx';
import { IAdapterOptions } from './interfaces';
export declare class Adapter {
    private serviceID;
    private token;
    private connected;
    private session;
    private parser;
    private logLevel;
    private username;
    private logger;
    private router;
    private webhookServer;
    private webhookURL;
    private storeUsers;
    constructor(obj: IAdapterOptions);
    users(): Promise<Map<string, object>>;
    channels(): Promise<Error>;
    serviceName(): string;
    serviceId(): string;
    getRouter(): Router | null;
    connect(): Observable<object>;
    disconnect(): Promise<null>;
    listen(): Observable<object>;
    send(data: object): Promise<object>;
    private user(key, cache?);
}

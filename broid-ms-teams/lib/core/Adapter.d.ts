/// <reference types="bluebird" />
/// <reference types="express" />
import * as Promise from 'bluebird';
import { Router } from 'express';
import { Observable } from 'rxjs/Rx';
import { IAdapterOptions } from './interfaces';
export declare class Adapter {
    private connected;
    private logLevel;
    private logger;
    private parser;
    private router;
    private serviceID;
    private storeUsers;
    private storeAddresses;
    private token;
    private tokenSecret;
    private webhookServer;
    private session;
    private sessionConnector;
    constructor(obj: IAdapterOptions);
    users(): Promise<Map<string, object>>;
    channels(): Promise<Error>;
    addresses(id: string): Promise<object | Error>;
    serviceId(): string;
    serviceName(): string;
    getRouter(): Router | null;
    connect(): Observable<object>;
    disconnect(): Promise<null>;
    listen(): Observable<object>;
    send(data: object): Promise<object>;
}

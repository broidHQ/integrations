/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import { Router } from 'express';
import { Observable } from 'rxjs/Rx';
import { IAdapterOptions } from './interfaces';
export declare class Adapter {
    private connected;
    private emitter;
    private logLevel;
    private logger;
    private parser;
    private router;
    private serviceID;
    private storeUsers;
    private token;
    private tokenSecret;
    private consumerSecret;
    private webhookServer;
    constructor(obj: IAdapterOptions);
    users(): Promise<Map<string, object>>;
    channels(): Promise<Error>;
    serviceId(): string;
    serviceName(): string;
    getRouter(): Router | null;
    connect(): Observable<object>;
    disconnect(): Promise<null>;
    listen(): Observable<object>;
    send(data: object): Promise<object | Error>;
    private user(id, fields?, cache?);
    private setupRouter();
}

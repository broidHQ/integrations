/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import { Router } from 'express';
import { Observable } from 'rxjs/Rx';
import { IAdapterOptions } from './interfaces';
export declare class Adapter {
    private connected;
    private serviceID;
    private token;
    private session;
    private parser;
    private logLevel;
    private logger;
    private router;
    private webhookServer;
    private webhookURL;
    constructor(obj: IAdapterOptions);
    users(): Promise<Error>;
    channels(): Promise<Error>;
    serviceId(): string;
    serviceName(): string;
    getRouter(): Router | null;
    connect(): Observable<object>;
    disconnect(): Promise<null>;
    listen(): Observable<object>;
    send(data: object): Promise<object | Error>;
    private setupRouter();
}

/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import { Router } from 'express';
import { Observable } from 'rxjs/Rx';
import { IAdapterOptions } from './interfaces';
export declare class Adapter {
    private serviceID;
    private username;
    private token;
    private tokenSecret;
    private connected;
    private parser;
    private logLevel;
    private logger;
    private webhookServer;
    private session;
    private emitter;
    private router;
    constructor(obj: IAdapterOptions);
    users(): Promise<Error>;
    channels(): Promise<Error>;
    serviceId(): string;
    getRouter(): Router | null;
    serviceName(): string;
    connect(): Observable<object>;
    disconnect(): Promise<null>;
    listen(): Observable<object>;
    send(data: any): Promise<object | Error>;
    private setupRouter();
}

/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import { Router } from 'express';
import { Observable } from 'rxjs/Rx';
import { IAdapterOptions } from './interfaces';
export declare class Adapter {
    private serviceID;
    private token;
    private tokenSecret;
    private connected;
    private session;
    private parser;
    private logLevel;
    private username;
    private logger;
    private emitter;
    private router;
    private webhookServer;
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

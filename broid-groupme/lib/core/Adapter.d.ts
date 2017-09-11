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
    private emitter;
    private parser;
    private logLevel;
    private logger;
    private router;
    private webhookServer;
    constructor(obj: IAdapterOptions);
    serviceName(): string;
    getRouter(): Router | null;
    users(): Promise<Error>;
    channels(): Promise<any>;
    serviceId(): string;
    connect(): Observable<object>;
    disconnect(): Promise<null>;
    listen(): Observable<object>;
    send(data: any): Promise<object | Error>;
    private setupRouter();
}

/// <reference types="bluebird" />
/// <reference types="express" />
import { ISendParameters } from '@broid/schemas';
import * as Promise from 'bluebird';
import { Router } from 'express';
import { Observable } from 'rxjs/Rx';
import { IAdapterOptions } from './interfaces';
export declare class Adapter {
    serviceID: string;
    private appID;
    private appSecret;
    private client;
    private connected;
    private emitter;
    private logLevel;
    private logger;
    private parser;
    private router;
    private webhookServer;
    constructor(obj: IAdapterOptions);
    serviceId(): string;
    serviceName(): string;
    connect(): Observable<object>;
    disconnect(): Promise<null>;
    listen(): Observable<object>;
    users(): Promise<any | Error>;
    getRouter(): Router | null;
    send(data: ISendParameters): Promise<object | Error>;
    private uploadFile(url, fType, file);
    private setupRouter();
}

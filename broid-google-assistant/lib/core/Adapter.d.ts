/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import { Router } from 'express';
import { Observable } from 'rxjs/Rx';
import { IAdapterOptions } from './interfaces';
export declare class Adapter {
    private assistant;
    private actionsMap;
    private serviceID;
    private token;
    private tokenSecret;
    private connected;
    private emitter;
    private parser;
    private logLevel;
    private username;
    private logger;
    private router;
    private webhookServer;
    constructor(obj: IAdapterOptions);
    serviceName(): string;
    users(): Promise<Error>;
    channels(): Promise<Error>;
    serviceId(): string;
    getRouter(): Router | null;
    connect(): Observable<object>;
    disconnect(): Promise<null>;
    listen(): Observable<object>;
    send(data: object): Promise<object | Error>;
    private addIntent(trigger);
    private setupRouter();
    private sendMessage(isSSML, content, noInputs);
}

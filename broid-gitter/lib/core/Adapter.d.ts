import * as Promise from 'bluebird';
import { Observable } from 'rxjs/Rx';
import { IAdapterOptions } from './interfaces';
export declare class Adapter {
    private ee;
    private logLevel;
    private logger;
    private connected;
    private me;
    private parser;
    private serviceID;
    private session;
    private token;
    constructor(obj?: IAdapterOptions);
    users(): Promise<Error>;
    channels(): Promise<any>;
    serviceName(): string;
    serviceId(): string;
    getRouter(): null;
    connect(): Observable<object>;
    disconnect(): Promise<null>;
    listen(): Observable<object>;
    send(data: any): Promise<object | Error>;
    private joinRoom(room);
}

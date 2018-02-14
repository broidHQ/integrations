import * as Promise from 'bluebird';
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
    private storeUsers;
    private storeFlows;
    constructor(obj?: IAdapterOptions);
    users(): Promise<Map<string, any>>;
    channels(): Promise<Map<string, any>>;
    serviceId(): string;
    serviceName(): string;
    getRouter(): null;
    connect(): Observable<object>;
    disconnect(): Promise<null>;
    listen(): Observable<object>;
    send(data: any): Promise<object | Error>;
    private userByID(userID);
    private flowByID(flowID);
}

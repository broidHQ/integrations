import * as Promise from 'bluebird';
import { Router  } from 'express';
import { Observable } from 'rxjs/Rx';

export interface IAdapterHTTPOptions {
  host: string;
  port: number;
}

export interface IAdapterOptions {
  http?: IAdapterHTTPOptions;
  logLevel?: string;
  serviceID?: string;
}

export interface IAdapter {
    serviceName(): string;
    serviceId(): string;
    getRouter(): Router | null;
    users(): Promise<Map<string, object>  | Error>;
    channels(): Promise<Map<string, object>  | Error>;
    connect(): Observable<object>;
    disconnect(): Promise<null>;
    listen(): Observable<object>;
    send(data: any): Promise<object | Error>;
}

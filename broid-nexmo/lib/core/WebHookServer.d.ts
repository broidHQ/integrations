/// <reference types="node" />
/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import * as EventEmitter from 'events';
import * as express from 'express';
import { IAdapterHTTPOptions } from './interfaces';
export declare class WebHookServer extends EventEmitter {
    private express;
    private logger;
    private httpClient;
    private host;
    private port;
    constructor(router: express.Router, options: IAdapterHTTPOptions, logLevel?: string);
    listen(): void;
    close(): Promise<null>;
    private setupExpress(router);
}

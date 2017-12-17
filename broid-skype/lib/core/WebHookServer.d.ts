/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import * as express from 'express';
import { IAdapterHTTPOptions } from './interfaces';
export declare class WebHookServer {
    private express;
    private logger;
    private httpServer;
    private host;
    private port;
    constructor(router: express.Router, options: IAdapterHTTPOptions, logLevel?: string);
    listen(): void;
    close(): Promise<null>;
    private setupExpress(router);
}

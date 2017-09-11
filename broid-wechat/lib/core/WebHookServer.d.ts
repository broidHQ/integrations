/// <reference types="express" />
/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import * as express from 'express';
import { IAdapterHTTPOptions } from './interfaces';
export declare class WebHookServer {
    private express;
    private host;
    private httpClient;
    private logger;
    private port;
    constructor(options: IAdapterHTTPOptions, router: express.Router, logLevel: string);
    listen(): void;
    close(): Promise<null>;
    private setupExpress(router);
}

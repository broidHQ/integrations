/// <reference types="bluebird" />
import { IActivityStream } from '@broid/schemas';
import * as Promise from 'bluebird';
import { IWebHookEvent } from './interfaces';
export declare class Parser {
    serviceID: string;
    generatorName: string;
    private logger;
    constructor(serviceName: string, serviceID: string, logLevel: string);
    validate(event: any): Promise<object | null>;
    parse(event: any): Promise<any>;
    normalize(event: IWebHookEvent): Promise<IActivityStream>;
    private createIdentifier();
    private createActivityStream(normalized);
    private parseAttachment(attachment);
}

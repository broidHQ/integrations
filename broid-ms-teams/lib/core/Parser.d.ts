/// <reference types="bluebird" />
import { IActivityStream } from '@broid/schemas';
import * as Promise from 'bluebird';
export declare class Parser {
    serviceID: string;
    generatorName: string;
    private logger;
    constructor(serviceName: string, serviceID: string, logLevel: string);
    validate(event: any): Promise<IActivityStream | null>;
    parse(event: any): Promise<IActivityStream | null>;
    private createIdentifier();
    private createActivityStream(normalized);
}

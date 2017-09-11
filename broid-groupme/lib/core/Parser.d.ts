/// <reference types="bluebird" />
import * as Promise from 'bluebird';
export declare class Parser {
    serviceID: string;
    generatorName: string;
    private logger;
    constructor(serviceName: string, serviceID: string, logLevel: string);
    validate(event: any): Promise<object | null>;
    parse(event: any): Promise<object | null>;
    private createIdentifier();
    private createActivityStream(normalized);
}

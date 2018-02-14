/// <reference types="bluebird" />
import * as Promise from 'bluebird';
export declare class Parser {
    serviceID: string;
    generatorName: string;
    private logger;
    constructor(serviceName: string, serviceID: string, logLevel: string);
    validate(event: any): Promise<any>;
    parse(event: any): Promise<any>;
    normalize(event: any): Promise<any>;
    private createIdentifier();
    private createActivityStream(normalized);
    private createAuthor(source);
    private createTarget(source);
}

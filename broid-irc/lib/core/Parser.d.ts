/// <reference types="bluebird" />
import * as Promise from 'bluebird';
export declare class Parser {
    serviceID: string;
    generatorName: string;
    private logger;
    private username;
    constructor(serviceName: string, username: string, serviceID: string, logLevel: string);
    validate(event: object | null): Promise<object | null>;
    parse(event: object | null): Promise<object | null>;
}

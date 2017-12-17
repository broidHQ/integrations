/// <reference types="bluebird" />
import * as actionsSdk from 'actions-on-google';
import * as Promise from 'bluebird';
export declare class Parser {
    serviceID: string;
    generatorName: string;
    private logger;
    private username;
    constructor(serviceName: string, serviceID: string, username: string, logLevel: string);
    validate(event: any): Promise<object | null>;
    parse(event: actionsSdk.ActionsSdkAssistant): Promise<object | null>;
    private createIdentifier();
    private createActivityStream();
}

import { IActivityStream } from '@broid/schemas';
import * as Promise from 'bluebird';
export declare class Parser {
    serviceID: string;
    generatorName: string;
    private logger;
    constructor(serviceName: string, serviceID: string, logLevel: string);
    validate(event: any): Promise<any>;
    parse(event: any): Promise<IActivityStream | null>;
    normalize(evt: any): Promise<any>;
    private createIdentifier();
    private createActivityStream(normalized);
}

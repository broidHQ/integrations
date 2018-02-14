import { IActivityStream } from '@broid/schemas';
import * as Promise from 'bluebird';
export declare class Parser {
    serviceID: string;
    generatorName: string;
    private logger;
    constructor(serviceName: string, serviceID: string, logLevel: string);
    validate(event: any): Promise<object>;
    parse(event: any): Promise<IActivityStream>;
    normalize(raw: any): Promise<object | null>;
    private createIdentifier();
    private createActivityStream(normalized);
}

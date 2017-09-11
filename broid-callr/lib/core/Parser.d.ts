import { IActivityStream } from '@broid/schemas';
import * as Promise from 'bluebird';
import { ICallrWebHookEvent } from './interfaces';
export declare class Parser {
    serviceID: string;
    generatorName: string;
    private logger;
    constructor(serviceName: string, serviceID: string, logLevel: string);
    validate(event: any): Promise<object>;
    parse(event: any): Promise<IActivityStream>;
    normalize(event: ICallrWebHookEvent): Promise<any>;
    private createIdentifier();
    private createActivityStream(normalized);
}

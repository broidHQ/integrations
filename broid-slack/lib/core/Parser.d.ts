import * as Promise from 'bluebird';
import { IMessage } from './interfaces';
export declare class Parser {
    serviceID: string;
    generatorName: string;
    private logger;
    constructor(serviceName: string, serviceID: string, logLevel: string);
    validate(event: any): Promise<object>;
    parse(event: IMessage | null): Promise<object>;
    private createIdentifier();
    private createActivityStream(normalized);
    private ts2Timestamp(ts);
    private parseFile(attachment);
}

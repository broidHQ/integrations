/// <reference types="bluebird" />
import { IActivityStream } from '@broid/schemas';
import * as Promise from 'bluebird';
export declare class Parser {
    generatorName: string;
    serviceID: string;
    private logger;
    private userCache;
    private wechatClient;
    constructor(serviceName: string, wechatClient: any, serviceID: string, logLevel: string);
    validate(event: object | null): Promise<object | null>;
    parse(event: object): Promise<IActivityStream | null>;
    private getUserName(openid);
    private createActivityStream(normalized);
    private parseImage(normalized);
    private parseText(normalized);
    private parseMultiMedia(normalized, messageType, mediaType);
}

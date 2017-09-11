/// <reference types="ramda" />
/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import { Logger } from './Logger';
declare const cleanNulls: any;
declare function capitalizeFirstLetter(str: string): string;
declare const defaults: (arg1: {}, arg0?: any) => <T2>(b: T2) => any;
declare const concat: (x0: any[]) => string;
declare function isUrl(url: any): any;
declare function fileInfo(file: any, logger?: Logger): Promise<{}>;
export { capitalizeFirstLetter, cleanNulls, concat, defaults, fileInfo, isUrl, Logger };

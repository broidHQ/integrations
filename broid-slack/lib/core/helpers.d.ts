import { IWebHookEvent } from './interfaces';
export declare function createActions(buttons: any[]): any[];
export declare function createSendMessage(data: any, message: any, actions: string, attachments: any, responseURL: string): any;
export declare function parseWebHookEvent(event: IWebHookEvent): any;

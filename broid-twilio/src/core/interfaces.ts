export interface IAdapterHTTPOptions {
  host: string;
  port: number;
}

export interface IAdapterOptions {
  logLevel: string;
  http: IAdapterHTTPOptions;
  serviceID: string;
  token: string;
  tokenSecret: string;
  username: string;
}

export interface ITwilioWebHookEvent {
  response: any;
  request: any;
}

export interface ITwilioActivityStreamObject {
  id: string;
  content?: string;
  mediaType?: string;
  type: string; // tslint:disable-line:no-reserved-keywords
  url?: string;
  attachment?: ITwilioMedia;
}

export interface ITwilioMedia {
  mediaType: string;
  type: string; // tslint:disable-line:no-reserved-keywords
  url: string;
}

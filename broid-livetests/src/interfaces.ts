import { IASBase } from '@broid/schemas';

export interface IAdapterHTTPOptions {
  host: string;
  port: Number;
}

export interface IConfigTemplate {
  http?: IAdapterHTTPOptions;
  token?: string;
}

export interface ITestCases {
  image?: boolean;
  message?: boolean;
  video?: boolean;
}

export interface IIntegrationConfigs {
  name: string;
  Adapter: any;
  configTemplate: IConfigTemplate;
  localtunnelPrefix?: string;
  to: IASBase;
  tests: ITestCases;
}

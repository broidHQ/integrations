export interface IAdapterOptions {
  token: string;
  tokenSecret: string;
  consumerSecret: string;
  consumerKey: string;
  username: string;
  serviceID: string;
  logLevel: string;
}

export interface ITwitterSendParameters {
  status?: string;
  twit_options: object;
  text?: string;
  screen_name?: string;
  user_id?: string;
  media_ids?: object[];
}

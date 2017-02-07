export interface IAdapterOptions {
  address: string;
  username: string;
  channels: string[];
  serviceID?: string;
  logLevel?: string;
  connectTimeout?: number;
}

export interface IActivityStream {
  readonly "@context": string;
  readonly published: number;
  readonly type: string;
  readonly generator: {};
  actor: {
    id: string;
    name: string;
    type: string;
  };
  target: {
    id: string;
    name: string;
    type: string;
  };
  object: {
    content: string;
    id: string;
    type: string;
  };
}

export interface ISendParameters {
  readonly "@context": string;
  readonly published: number;
  readonly type: string;
  readonly generator: {};
  actor: {
    id: string;
    name: string;
    type: string;
  };
  to: {
    id: string;
    type: string;
  };
  object: {
    content: string;
    id: string;
    type: string;
  };
}

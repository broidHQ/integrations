export interface IAdapterOptions {
  token: string;
  serviceID: string;
  logLevel: string;
}

export interface IActivityStream {
  actor?: IActivityActor;
  cc?: IActivityActor[];
  object?: IActivityStreamObject;
  target?: IActivityActor;
  readonly "@context": string;
  readonly generator: {};
  readonly published: number;
  readonly type: string;
}

export interface IActivityStreamObject {
  id: string;
  content?: string;
  context?: IActivityContext;
  name?: string;
  tag?: IActivityTag[];
  type: string;
}

export interface IActivityContext {
  content: string;
  name: string;
  type: string;
}

export interface IActivityActor {
  id: string;
  name: string;
  type: string;
}

export interface IActivityTag {
  id: string;
  name: string;
  type: string;
}

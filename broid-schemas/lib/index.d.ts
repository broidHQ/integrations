/// <reference types="bluebird" />
import * as Promise from 'bluebird';
export interface IASBase {
    id: string;
    name?: string;
    type: string;
}
export interface IASContext {
    content: string;
    name?: string;
    type: string;
}
export interface IASMedia {
    content?: string;
    context?: IASContext;
    id?: string;
    mediaType?: string;
    name?: string;
    preview?: string;
    type: string;
    url: string;
}
export interface IASObject {
    attachment?: IASMedia | IASMedia[] | null;
    content?: string;
    context?: IASContext;
    id: string;
    latitude?: number;
    longitude?: number;
    mediaType?: string;
    name?: string;
    preview?: string;
    tag?: IASTag | IASTag[];
    type: string;
    url?: string;
}
export interface IActivityStream {
    readonly '@context': string;
    readonly published: number;
    readonly type: string;
    readonly generator: IASBase;
    actor?: IASBase;
    target?: IASBase;
    object?: IASObject;
}
export interface IASTag {
    id: string;
    name: string;
    type: string;
}
export interface ISendParameters {
    readonly '@context': string;
    readonly type: string;
    readonly generator: {};
    actor?: IASBase;
    to: IASBase;
    object: IASObject;
}
export default function (data: any, schema: string): Promise<any>;

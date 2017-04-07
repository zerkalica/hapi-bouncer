// @flow

import ParsedUrl from 'hapi-bouncer/utils/ParsedUrl'

import type {IncomingMessage, NodeUrlParse, ServerResponse} from './node'

export type HapiServer = Object
export type HapiResponse = Object
export type HapiPlugin = Object

export type HapiReply = (result: any) => HapiResponse

export interface HapiRequest {
    app: Object;
    id: string;
    method: string;
    path: string;
    payload: Object;
    url: NodeUrlParse;
    headers: {[id: string]: string};
    params: {[id: string]: string};
    mime: string;
    raw: {
      req: IncomingMessage;
    };
    info: {
      remotePort: number;
      remoteAddress: string;
    }
}

export interface H2O2MapUriUrl {

}

export type HapiHandler = {
    file: {
        path: string
    }
} | {
    directory: {
        path: string;
        listing?: boolean;
    }
} | {
    proxy: H2O2Handler;
}

export type H2O2MapUriCb = (error: ?Error) => void

export type H2O2MapUri = (
    request: HapiRequest,
    cb: H2O2MapUriCb
) => void

export type H2O2OnResponse = (
    err: ?Error,
    res: ServerResponse,
    request: HapiRequest,
    reply: HapiReply,
    settings: Object,
    ttl: number
) => void|HapiResponse

export type H2O2Handler = {
    mapUri: H2O2MapUri;
    onResponse: H2O2OnResponse;
    xforward: boolean;
    localStatePassThrough: boolean;
    passThrough: boolean;
}

export type MapUriStrategy = (
    from: ParsedUrl,
    to: ParsedUrl,
    parsed: NodeUrlParse
) => H2O2MapUriUrl

export interface HapiRoute {
    method: string;
    vhost: string;
    path: string;
    handler: Object;
}

export interface HapiRoutes {
    cors?: {
        credentials?: boolean;
        headers?: string[];
    }
}

export interface HapiConnection {
    port: number;
    host: string;
    tls: string;
    routes?: HapiRoutes;
    register(plugins: any): void;
}

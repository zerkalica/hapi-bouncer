// @flow

import ParsedUrl from 'hapi-bouncer/utils/ParsedUrl'
import type {HapiHandler, HapiRoutes} from './hapi'

export interface PayloadRec {
    oldUrl: string;
    newUrl: string;
    headers: {[id: string]: string};
    method: string;
    mime: string;
    params: {[id: string]: string};
    payload: string;
}

export interface Link {
    from: ParsedUrl;
    to: ParsedUrl;
}

export interface TlsRec {
    key?: ?string;
    cert?: ?string;
    ca?: ?string;
    requestCert?: ?boolean;
    rejectUnauthorized?: ?boolean;
}

export interface RawConnection {
    from: string;
    to: string;
}

export interface RawConfig {
    host?: string;
    routes?: HapiRoutes;
    tls: TlsRec;
    connections: RawConnection[];
}

export interface NormalizedConnection {
    server: {
        port: number;
        tls: TlsRec;
    };
    links: Link[];
}

export interface NormalizedConfig {
    host?: string;
    routes?: HapiRoutes;
    connections: NormalizedConnection[];
}

export interface ProxyHapiPluginOptions {
    links: Link[];
    createHandler?: (link: Link) => HapiHandler;
    sanitizeCookie?: (cookie: string) => string;
}

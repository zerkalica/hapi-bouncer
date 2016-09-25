// @flow
import type {ServerResponse as NodeServerResponse} from 'http'

export interface NodeUrlParse {
    protocol?: string;
    slashes?: boolean;
    auth?: string;
    host?: string;
    port?: string;
    hostname?: string;
    hash?: string;
    search?: string;
    query?: any; // null | string | Object
    pathname?: string;
    path?: string;
    href: string;
}

export interface ServerResponse extends NodeServerResponse {
    headers: {[id: string]: string}
}

export type {IncomingMessage} from 'http'

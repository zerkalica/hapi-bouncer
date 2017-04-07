// @flow

import path from 'path'
import __debug from 'debug'
import {Server} from 'hapi'

import Inert from 'inert'
import h2o2 from 'h2o2'

import type {HapiPlugin, HapiServer, HapiConnection} from 'hapi-bouncer/interfaces/hapi'
import type {NormalizedConfig, NormalizedConnection} from 'hapi-bouncer/interfaces/bouncer'
import proxyHapiPlugin from './proxyHapiPlugin'

const debug = __debug('hapi-bouncer:createServer:debug')

export const connectionDefaults = {
    host: '0.0.0.0',
    routes: {
        cors: {
            credentials: true,
            headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match', 'Accept-Language']
        }
    }
}

function showError(err: ?Error) {
    if (err) {
        console.error(err)
        process.exit(1)
    }
}

export default function createServer({connections, host, routes, links}: NormalizedConfig): HapiServer {
    const server: HapiServer = new Server({
        debug: {
            request: ['error']
        }
    })

    server.register([Inert, h2o2], showError)

    const conns: HapiConnection[] = connections.map((connection: NormalizedConnection) => {
        const proxyHapiPluginWithOptions = {
            register: proxyHapiPlugin,
            options: {links: connection.links}
        }

        const conn: HapiConnection = server.connection({
            ...connectionDefaults,
            host,
            routes,
            ...connection.server
        })

        conn.register([proxyHapiPluginWithOptions], showError)

        return conn
    })

    return server
}

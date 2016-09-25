// @flow

import path from 'path'
import __debug from 'debug'
import {Server} from 'hapi'

import Inert from 'inert'
import h2o2 from 'h2o2'

import type {HapiPlugin, HapiConnection} from 'hapi-bouncer/interfaces/hapi'
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

export default function createServer({connections, host, links}: NormalizedConfig) {
    const server = new Server({
        debug: {
            request: ['error']
        }
    })
    connections.forEach((connection: NormalizedConnection) => {
        server.connection({
            ...connectionDefaults,
            host,
            ...connection
        })
    })

    const proxyHapiPluginWithOptions = {
        register: proxyHapiPlugin,
        options: {links}
    }
    server.register([Inert, h2o2, proxyHapiPluginWithOptions], (err: ?Error) => {
        if (err) {
            console.error(err)
            process.exit(1)
        }
    })


    return server
}

// @flow

import createProxyHandler from './handlers/proxy/createProxyHandler'
import defaultMapUriStrategy from './handlers/proxy/mapUri/defaultMapUriStrategy'

import type {HapiHandler} from 'hapi-bouncer/interfaces/hapi'
import type {Link} from 'hapi-bouncer/interfaces/bouncer'
import ParsedUrl from 'hapi-bouncer/utils/ParsedUrl'

export default function createHandler({from, to}: Link): HapiHandler {
    let handler: HapiHandler
    switch (to.protocol) {
        case 'file':
            handler = {
                file: {
                    path: to.hostname
                }
            }
            break
        case 'directory':
            handler = {
                directory: {
                    path: to.hostname,
                    listing: true
                }
            }
            break
        default:
            handler = {
                proxy: createProxyHandler({
                  from,
                  to,
                  mapUriStrategy: defaultMapUriStrategy
                })
            }
    }

    return handler
}

// @flow

import __debug from 'debug'

import type {
    HapiServer,
    HapiResponse,
    HapiRoute,
    HapiRequest,
    HapiReply,
    HapiHandler
} from './interfaces/hapi'
import type {Link} from './interfaces/bouncer'

import defaultSanitizeCookie from './utils/sanitizeCookie'
import ParsedUrl from './utils/ParsedUrl'
import defaultCreateHandler from './createHandler'

const debug = __debug('hapi-bouncer:proxyHapiPlugin:debug')

function routeToHapiRoute(
  {from, to}: Link,
  handler: HapiHandler
): HapiRoute {
    debug('add route %s://%s%s%s => %s://%s%s',
        from.protocol,
        from.hostname,
        from.port ? (':' + from.port) : '',
        from.path,

        to.protocol,
        to.hostname,
        to.port ? (':' + to.port) : '',
    )

    let prefix: string = from.path
    if (prefix[prefix.length - 1] === '/') {
        prefix = prefix.substring(0, -1)
    }

    return {
        method: '*',
        vhost: from.hostname,
        path: prefix + '/{p*}',
        handler
    }
}

export interface ProxyHapiPluginOptions {
    links: Link[];
    createHandler?: (link: Link) => HapiHandler;
    sanitizeCookie?: (cookie: string) => string;
}

const proxyHapiPlugin = {
    register(server: HapiServer, opts: ProxyHapiPluginOptions, next: () => HapiResponse) {
        const sanitizeCookie = opts.sanitizeCookie || defaultSanitizeCookie
        const createHandler: (link: Link) => HapiHandler = opts.createHandler || defaultCreateHandler
        function onRequest(request: HapiRequest, reply: HapiReply): HapiResponse {
            const req = request.raw.req
            const cookie: string = req.headers.cookie
            // sanitize bad cookies, like TestForThirdPartyCookie=yes; __promo_session=0_1437749424386; true; _ga_cid=1001702645.1437749425"
            if (cookie) {
                req.headers.cookie = sanitizeCookie(cookie)
            }

            return reply.continue()
        }

        opts.links.forEach((link: Link) => {
            server.route(routeToHapiRoute(link, createHandler(link)))
        })
        server.ext('onRequest', onRequest)
        next()
    }
}

proxyHapiPlugin.register.attributes = {
    name: 'proxyHapiPlugin',
    version: '1.0.0'
}

export default proxyHapiPlugin

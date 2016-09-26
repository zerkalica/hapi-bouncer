// @flow
import __debug from 'debug'
import url from 'url'

import createOnResponse from './createOnResponse'

import getPayload from 'hapi-bouncer/utils/getPayload'
import ParsedUrl from 'hapi-bouncer/utils/ParsedUrl'

import type {
  MapUriStrategy,
  HapiRequest,
  H2O2MapUriCb
} from 'hapi-bouncer/interfaces/hapi'

import type {PayloadRec} from 'hapi-bouncer/interfaces/bouncer'

const debug = __debug('hapi-bouncer:createProxyHandler:debug')
const debugErr = __debug('hapi-bouncer:createProxyHandler:error')

export interface CreateProxyHandlerOptions {
    from: ParsedUrl;
    to: ParsedUrl;
    mapUriStrategy: MapUriStrategy;
    onPayload?: (payload: mixed) => void;
}

export default function createProxyHandler(
  {from, to, mapUriStrategy, onPayload}: CreateProxyHandlerOptions
) {
    const debugReq = __debug(`hapi-bouncer:createProxyHandler:${from.hostname}:req:debug`)
    const debugRes = __debug(`hapi-bouncer:createProxyHandler:${from.hostname}:res:debug`)
    if (!mapUriStrategy) {
        throw new Error('Strategy is not set')
    }

    debug('init %s to %s', from.hostname, to.hostname)

    function mapUri(request: HapiRequest, cb: H2O2MapUriCb): void {
        debug('mapUri %s to %s', from.hostname, to.hostname)
        const newUrl: string = url.format(mapUriStrategy(from, to, request.url))

        const headers: {[id: string]: string} = {
            'x-forwarded-proto': from.protocol,
            'x-forwarded-for': request.info.remoteAddress
        }
        if (request.info.remotePort) {
            headers['x-forwarded-port'] = String(request.info.remotePort)
        }

        const newHeaders: {[id: string]: string} = {
            ...request.headers
            //...headers,
        }

        getPayload(request.payload)
            .then((payload) => {
                const payloadRec: PayloadRec = {
                    oldUrl: request.url.href,
                    newUrl: newUrl,
                    headers: newHeaders,
                    method: request.method,
                    mime: request.mime,
                    params: request.params,
                    payload: payload
                }
                onPayload && onPayload(payloadRec)
                debugReq('%s', JSON.stringify({
                    ...payloadRec,
                    payload: (payload || '').substring(0, 300)
                }, null, '  '))
            })
            .catch((e: Error) => {
                debugErr('error: %o', e)
                // cb(null, newUrl, newHeaders)
            })
        cb(null, newUrl, newHeaders)
    }

    return {
        mapUri,
        onResponse: createOnResponse(debugRes, to),
        xforward: false,
        localStatePassThrough: true,
        passThrough: true
    }
}

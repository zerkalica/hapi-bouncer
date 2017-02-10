// @flow

import Wreck from 'wreck'
import ParsedUrl from 'hapi-bouncer/utils/ParsedUrl'

import type {ServerResponse} from 'hapi-bouncer/interfaces/node'
import type {
    HapiRequest,
    HapiReply,
    HapiResponse,
    H2O2OnResponse
} from 'hapi-bouncer/interfaces/hapi'

export default function createOnResponse(
  debugRes: () => void,
  to: ParsedUrl
): H2O2OnResponse {
    return function onResponse(
      err: ?Error,
      res: ServerResponse,
      request: HapiRequest,
      reply: HapiReply,
      settings: Object,
      ttl: number
    ): void|HapiResponse {
        if (err) {
            return reply(err)
        }

        Wreck.read(res, null, (err: ?Error, payload: Buffer) => {
            if (err) {
                return reply(err)
            }
            debugRes('%s', JSON.stringify({
                href: to.getHostUrl() + request.url.href,
                payload: payload.toString().substring(0, 50),
                statusCode: res.statusCode,
                statusMessage: res.statusMessage,
                //reqHeaders: request.headers,
                serverHeaders: res.headers
            }, null, '  '))

            const resp: HapiResponse = reply(payload)
                .code(res.statusCode)
                .ttl(ttl)
                .passThrough(settings.passThrough || false)

            resp.headers = {
                ...resp.headers || {},
                ...res.headers
            }

            return resp
        })
    }
}

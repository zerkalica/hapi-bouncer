// @flow

import ParsedUrl from 'hapi-bouncer/utils/ParsedUrl'
import type {H2O2MapUriUrl} from 'hapi-bouncer/interfaces/hapi'
import type {NodeUrlParse} from 'hapi-bouncer/interfaces/node'

export default function defaultMapUriStrategy(
  from: ParsedUrl,
  to: ParsedUrl,
  {query, pathname}: NodeUrlParse
): H2O2MapUriUrl {
    return {
        protocol: to.protocol,
        hostname: to.hostname,
        port: String(to.port),
        query,
        pathname: pathname || ''
    }
}

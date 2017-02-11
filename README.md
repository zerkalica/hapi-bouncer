# hapi-bouncer

Transaprent proxy. Pipe raw http traffic from incoming http requests to remote endpoints.

Proxy like [substack bouncy](https://github.com/substack/bouncy), but builded on top of [hapi](http://hapijs.com/).

* Supports https, and configurations via [node-config-loader](https://github.com/zerkalica/node-config-loader)
* Can be used as hapi plugin.
* Can log requests/responses and payloads.
* Can partially substitute resources by path: you can mount many resources to one endpoint.

Example:

site1.com is localhost 127.0.0.1

site2.com is external host.

Requests (https or http):

* site1.com proxyfied to http://localhost:8007
* site1.com/rest proxyfied to https://localhost:8008/rest-some
* site1.com/some proxyfied to http://site2.com/some
* site1.com/cas proxyfied to http://localhost:8008/cas

Install:

```bash
npm i -g hapi-bouncer
```

Configuration:

All files placed in ./conf directory:

```yaml
#_base#default-server.yml

host: 0.0.0.0
__push__: [connections]
```

If __push__ directive exists: concat connections data from all config files in ./conf directory.

```yaml
# ex2#default-server.yml

connections:
    -
        # Proxy for http and https:
        from: https?://site1.example.com
        to: http://localhost:8080
```

```yaml
# ex1#default-server.yml

connections:
    -
        from: https?://site1.com
        to: http://localhost:8007
    -
        from: https?://site1.com/rest
        to: http://localhost:8008/rest-some
    -
        from: https?://site1.com/some
        to: http://site2.com/some
    -
        from: https?://site1.com/sso
        to: http://localhost:8008/sso
    -
        from: https?://site1.com/cas
        to: http://localhost:8008/cas

```

```
; /etc/hosts

site1.com 127.0.0.1

```

SSL certificates:


```
ssl/server.crt
ssl/server.key
ssl/ca.crt
```


## Running as server:

```bash
hapi-bouncer --config=conf --certs=ssl --verbose
```

## Hapi plugin

```js

import {ParsedUrl, proxyHapiPlugin} from 'hapi-bouncer'
import type {Link, ProxyHapiPluginOptions} from 'hapi-bouncer'

const links: Link[] = [
    {from: new ParsedUrl('http?://site1.com/rest'), to: new ParsedUrl('http://extsite.com/api')}
]

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
```

## Interfaces

```js
// @flow

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
    tls: TlsRec;
    connections: RawConnection[];
}

export interface Link {
    from: ParsedUrl;
    to: ParsedUrl;
}

export interface ProxyHapiPluginOptions {
    links: Link[];
    createHandler?: (link: Link) => HapiHandler;
    sanitizeCookie?: (cookie: string) => string;
}

```

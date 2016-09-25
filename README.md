# hapi-bouncer

Pipe raw http traffic from incoming http requests to remote endpoints.

Proxy like [substack bouncy](https://github.com/substack/bouncy), but builded on top of [hapi](http://hapijs.com/).

## Features

* Supports https, and configurations in config.d.
* Can be used as hapi plugin.
* Can log requests/responses and payloads.

Install:

```bash
npm i -g hapi-bouncer
```

Configuration:

```yaml
#conf/main#default-server.yml

host: 0.0.0.0
connections:
    -
        # Proxy for http and https:
        from: https?://dev1.example.com
        to: http://localhost:8080
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

## hapi plugin:

```js

import {ParsedUrl, proxyHapiPlugin} from 'hapi-bouncer'
import type {Link, ProxyHapiPluginOptions} from 'hapi-bouncer'

const links: Link[] = []

const proxyHapiPluginWithOptions = {
    register: proxyHapiPlugin,
    options: ({links}: ProxyHapiPluginOptions)
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

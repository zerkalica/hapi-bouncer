// @flow

import path from 'path'
import fs from 'fs'

import ParsedUrl from './ParsedUrl'

import type {Link, RawConfig, TlsRec, NormalizedConnection, NormalizedConfig} from 'hapi-bouncer/interfaces/bouncer'

const HTTPS_MAGIC = 'https?'

function readCert(certDir: string, key?: string): ?string {
    if (!key) {
        return null
    }
    const file: string = path.resolve(certDir, key)
    if (fs.existsSync(file)) {
        return fs.readFileSync(file).toString()
    }

    return null
}

// export interface RawConnection {
//     from: string;
//     to: string;
// }

// export interface RawConfig {
//     host?: string;
//     tls: TlsRec;
//     connections: RawConnection[];
// }
//
// export interface NormalizedConnection {
//     port?: string;
//     tls?: TlsRec;
// }
// export interface NormalizedConfig {
//     host?: string;
//     connections: NormalizedConnection[];
//     links: Link[];
// }

export default function normalizeConnections(certDir: string, rc: RawConfig): NormalizedConfig {
    const rcTls = rc.tls || {}
    const tls: TlsRec = {
        requestCert: true,
        rejectUnauthorized: false,
        ...(rcTls: Object),
        key: readCert(certDir, rcTls.key || 'server.key'),
        cert: readCert(certDir, rcTls.cert || 'server.crt'),
        ca: readCert(certDir, rcTls.ca || 'ca.crt')
    }
    if (!rc.connections) {
        throw new Error('Need connection mappings in config')
    }
    const connMap: {[port: string]: NormalizedConnection} = {}
    for (let i = 0; i < rc.connections.length; i++) {
        const conn = rc.connections[i]
        const fromUrls: string[] = []
        if (conn.from.indexOf(HTTPS_MAGIC) === 0) {
            const fromUrlPart: string = conn.from.substring(HTTPS_MAGIC.length)
            fromUrls.push('http' + fromUrlPart)
            fromUrls.push('https' + fromUrlPart)
        } else {
            fromUrls.push(conn.from)
        }

        for (let j = 0; j < fromUrls.length; j++) {
            const fromUrl: string = fromUrls[j]

            const from = new ParsedUrl(fromUrl)
            const to = new ParsedUrl(conn.to)
            const port: number = from.port ? from.port : (from.protocol === 'https' ? 443 : 80)
            const key: string = String(port)
            if (!connMap[key]) {
                connMap[key] = {
                    server: {
                        tls: from.protocol === 'https' ? tls : false,
                        port,
                    },
                    links: []
                }
            }
            connMap[key].links.push({from, to})
        }
    }

    const connections: NormalizedConnection[] = Object.keys(connMap)
        .map((port: string) => connMap[port])

    return {
        host: rc.host || '0.0.0.0',
        connections
    }
}

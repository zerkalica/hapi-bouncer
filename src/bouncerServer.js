// @flow

import __debug from 'debug'

import fs from 'fs'
import path from 'path'
import loader from 'node-config-loader'

import createServer from './createServer'
import normalizeConnections from './utils/normalizeConnections'
import type {RawConfig, NormalizedConfig} from './interfaces/bouncer'

const debug = __debug('hapi-bouncer:debug')

function normalizeMask(configsGlob: string): ?string {
    let result: string
    let isDir = false
    try {
        isDir = fs.lstatSync(configsGlob).isDirectory()
    } catch (e) {}

    if (isDir) {
        result = configsGlob + '/**/*.{json,yml,yaml}'
    }

    return result
}

class ConfigRoots {
    roots: string[]
    constructor(roots: string[] = []) {
        this.roots = roots
    }

    add(dir: string): void {
        const mask: ?string = normalizeMask(dir)
        if (mask) {
            this.roots.push(mask)
        }
    }
}

export default function bouncerServer(args: {[id: string]: any}) {
    const configRoots = new ConfigRoots()

    args.config && configRoots.add(args.config)
    process.env.HOME && configRoots.add(path.join(process.env.HOME, '.config', 'hapi-bouncer'))
    debug('config dirs: %o', configRoots.roots)
    loader({
        mask: configRoots.roots,
        env: process.env.NODE_ENV,
        instance: 'server'
    })
        .then((conf: RawConfig) => {
            debug('raw config: %s', JSON.stringify(conf, null, '  '))
            const config: NormalizedConfig = normalizeConnections(
                args.certs,
                ({
                    ...conf,
                    ...args.app
                }: RawConfig)
            )
            // debug('normalized config: %s', JSON.stringify(config, null, '  '))
            const server = createServer(config)
            server.start((err: ?Error) => {
                if (err) {
                    throw err
                }
                console.log('Server is listening ' + server.info.uri.toLowerCase());
            })
        })
        .catch((e: Error) => {
            console.error(e.message, e.stack)
            process.exit(1)
        })
}

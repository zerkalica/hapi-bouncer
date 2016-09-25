// @flow

import Wreck from 'wreck'
import type {ReadStream} from 'fs'

export default function getPayload<P: string|ReadStream>(payloadStream: P): Promise<string> {
    return (typeof payloadStream !== 'object' || payloadStream === null)
        ? Promise.resolve((payloadStream: any))
        : new Promise((resolve, reject) => {
            Wreck.read(payloadStream, {}, (err: Error, payload: P) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(payload.toString())
                }
            })
        })
}

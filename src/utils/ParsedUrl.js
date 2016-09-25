// @flow
import url from 'url'
import path from 'path'

const LOCAL_PROTOCOLS = ['file', 'directory']
const PROTOCOL_SEP = '://'

// {
//     protocol?: string;
//     slashes?: boolean;
//     auth?: string;
//     host?: string;
//     port?: string;
//     hostname?: string;
//     hash?: string;
//     search?: string;
//     query?: any; // null | string | Object
//     pathname?: string;
//     path?: string;
//     href: string;
//   }

export default class ParsedUrl {
    isLocalProtocol: boolean
    protocol: string
    port: number
    hostname: string
    path: string

    constructor(link: string) {
        const localProtocol = LOCAL_PROTOCOLS.filter(p => link.indexOf(p + PROTOCOL_SEP) === 0)[0]
        let p: ParsedUrl | null
        if (localProtocol) {
            this.isLocalProtocol = true
            this.protocol = localProtocol
            this.port = 0
            this.path = ''
            this.hostname = link.substring(localProtocol.length + PROTOCOL_SEP.length)
        } else {
            const {protocol, port, hostname, path: pth} = url.parse(link)
            this.protocol = protocol ? protocol.substring(0, protocol.length - 1) : ''
            if (port) {
                this.port = Number(port)
            }
            this.path = pth || ''
            this.hostname = hostname || ''
        }
    }
}

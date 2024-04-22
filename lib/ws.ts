import type { Server } from 'bun'
import { unregisterConnection } from './registry'

const PORT = process.env['WS_PORT'] || 3100

interface WebSocketData {
    cid: string
}

let server: Server

export function startWebsocketServer() {
    server = Bun.serve<WebSocketData>({
        port: PORT,
        fetch(req, server) {
            const url = new URL(req.url)
            const cid = url.searchParams.get('cid')
            if (url.pathname === '/connect' && cid) {
                const upgrade = server.upgrade(req, { data: { cid } })
                if (!upgrade) {
                    return new Response('Upgrade failed :(', { status: 500 })
                } else {
                    return new Response(null, { status: 101 })
                }
            }
            return new Response('Invalid Path :(', { status: 404 })
        },
        websocket: {
            open(socket) {
                socket.subscribe(socket.data.cid)
            },
            message() {},
            close(socket) {
                const { cid } = socket.data
                socket.unsubscribe(cid)
                unregisterConnection(cid)
            }
        }
    })
    console.log(`websocket server created at port ${server.port}`)
}

function publish(topics: Iterable<string>, ...payloads: string[]) {
    for (const topic of topics) {
        server?.publish(topic, [...payloads].join(':'))
    }
}

export function pushStateChange(topics: Iterable<string>, value: string, stateId: string) {
    publish(topics, 'c', stateId, value)
}

export function pushListUpdate(topics: Iterable<string>, listId: string, itemId: string, prevId: string) {
    publish(topics, 'u', listId, itemId, prevId)
}

export function pushListInsert(topics: Iterable<string>, listId: string, itemId: string, insertBeforeId: string) {
    publish(topics, 'i', listId, itemId, insertBeforeId)
}

export function pushListInsertLast(topics: Iterable<string>, listId: string, itemId: string) {
    publish(topics, 'l', listId, itemId)
}

export function pushListDelete(topics: Iterable<string>, listId: string, itemId: string) {
    publish(topics, 'd', listId, itemId)
}

export function pushRedirect(topic: string, url: string) {
    publish([topic], 'r', url)
}

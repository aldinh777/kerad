import type { Server } from 'bun'
import { renderer } from './renderer'

const PORT = process.env['WEBSOCKET_PORT'] || 3100

interface WebSocketData {
    cid: string
}

let server: Server
function startWebsocketServer() {
    server = Bun.serve<WebSocketData>({
        port: PORT,
        fetch(req, server) {
            const cid = new URL(req.url).pathname.slice(1)
            if (!cid) {
                return new Response('Invalid Path :(', { status: 404 })
            }
            const upgrade = server.upgrade(req, { data: { cid } })
            if (!upgrade) {
                return new Response('Upgrade failed :(', { status: 500 })
            }
        },
        websocket: {
            open(socket) {
                socket.subscribe(socket.data.cid)
            },
            message() {},
            close(socket) {
                const { cid } = socket.data
                socket.unsubscribe(cid)
                renderer.unsubscribe(cid)
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

export const ws = {
    startServer: startWebsocketServer,
    pushStateChange(topics: Iterable<string>, value: string, stateId: string) {
        publish(topics, 'c', stateId, value)
    },
    pushListUpdate(topics: Iterable<string>, listId: string, itemId: string, prevId: string) {
        publish(topics, 'u', listId, itemId, prevId)
    },
    pushListInsert(topics: Iterable<string>, listId: string, itemId: string, insertBeforeId: string) {
        publish(topics, 'i', listId, itemId, insertBeforeId)
    },
    pushListInsertLast(topics: Iterable<string>, listId: string, itemId: string) {
        publish(topics, 'l', listId, itemId)
    },
    pushListDelete(topics: Iterable<string>, listId: string, itemId: string) {
        publish(topics, 'd', listId, itemId)
    }
}

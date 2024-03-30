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

export const ws = {
    startServer: startWebsocketServer,
    pushStateChange(value: string, stateId: string, topics: string[]) {
        for (const topic of topics) {
            server.publish(topic, ['c', stateId, value].join(':'))
        }
    },
    pushListUpdate(itemId: string, prevId: string, topics: string[]) {
        for (const topic of topics) {
            server.publish(topic, ['u', itemId, prevId].join(':'))
        }
    },
    pushListInsert(itemId: string, insertBeforeId: string, topics: string[]) {
        for (const topic of topics) {
            server.publish(topic, ['ib', itemId, insertBeforeId].join(':'))
        }
    },
    pushListInsertLast(itemId: string, insertBeforeId: string, topics: string[]) {
        for (const topic of topics) {
            server.publish(topic, ['ie', itemId, insertBeforeId].join(':'))
        }
    },
    pushListDelete(itemId: string, topics: string[]) {
        for (const topic of topics) {
            server.publish(topic, ['d', itemId].join(':'))
        }
    }
}

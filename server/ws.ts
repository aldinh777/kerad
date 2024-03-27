import { connectToHub } from '../lib/bun-worker-hub'

const port = process.env['WEBSOCKET_PORT'] || 3100
const hub = connectToHub({
    async pushState(value, stateId, topics) {
        for (const topic of topics) {
            server.publish(topic, ['u', stateId, value].join(':'))
        }
    }
})

interface WebSocketData {
    cid: string
}

const server = Bun.serve<WebSocketData>({
    port: port,
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
            hub.fetch('renderer', 'unsubscribe', cid)
        }
    }
})

console.log(`websocket server created at http://${server.hostname}:${server.port}`)

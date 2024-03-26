import { join } from 'path'
import { connectToHub } from '../lib/bun-worker-hub'

const port = process.env.HTTP_PORT || 3000
const hub = connectToHub()

const server = Bun.serve({
    port: port,
    async fetch(req) {
        const { pathname } = new URL(req.url)
        const jsxPath = join(import.meta.dir, '../src', pathname, 'Page.jsx')
        const jsxFile = Bun.file(jsxPath)
        if (await jsxFile.exists()) {
            const connectId = await hub.fetch('ws', 'getConnectionId')
            const html = await hub.fetch('renderer', 'renderJSX', jsxPath, connectId)
            return new Response(html, { headers: { 'Content-Type': 'text/html' } })
        }
        const filename = pathname === '/' ? '/index.html' : pathname
        const file = Bun.file(join(import.meta.dir, '../public', filename))
        if (await file.exists()) {
            return new Response(file)
        }
        return new Response('Not Found', { status: 404 })
    }
})

console.log(`http server created at http://${server.hostname}:${server.port}`)

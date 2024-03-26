import { join } from 'path'
import { connectToHub } from '../lib/bun-worker-hub'
import { randomString } from '@aldinh777/toolbox/random'

const port = process.env.HTTP_PORT || 3000
const hub = connectToHub()

const server = Bun.serve({
    port: port,
    async fetch(req) {
        const { pathname } = new URL(req.url)
        const jsxPath = join(import.meta.dir, '../src', pathname, 'Page.jsx')
        const jsxFile = Bun.file(jsxPath)
        if (await jsxFile.exists()) {
            const connectionId = randomString(6)
            const html = await hub.fetch('renderer', 'renderJSX', jsxPath, connectionId)
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

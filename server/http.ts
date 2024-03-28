import { join } from 'path'
import { connectToHub } from '../lib/bun-worker-hub'
import { randomString } from '@aldinh777/toolbox/random'
import type { TriggerResult } from '../lib/hasher'

const port = process.env['HTTP_PORT'] || 3000
const hub = connectToHub()

const server = Bun.serve({
    port: port,
    async fetch(req) {
        const url = new URL(req.url)
        const { pathname } = url
        if (pathname === '/trigger') {
            const result = (await hub.fetch('renderer', 'triggerEvent', url.search.slice(1))) as TriggerResult
            const { status, data, error } = result
            const jsonHeader = { 'Content-Type': 'application/json' }
            if (status === 'not found') {
                return new Response(JSON.stringify({ status: 'not found' }), { status: 404, headers: jsonHeader })
            } else if (status === 'error') {
                const message = error instanceof Error ? error.message : error
                return new Response(JSON.stringify({ status: 'error', error: message }), {
                    status: 500,
                    headers: jsonHeader
                })
            } else {
                return new Response(JSON.stringify({ status: 'success', data: data }), { headers: jsonHeader })
            }
        }
        const jsxPath = join(import.meta.dir, '../src', pathname, 'Page.jsx')
        const jsxFile = Bun.file(jsxPath)
        if (await jsxFile.exists()) {
            const connectionId = randomString(6)
            const html = (await hub.fetch('renderer', 'renderJSX', jsxPath, connectionId)) as string
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

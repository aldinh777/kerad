import { join } from 'path'
import { renderer } from './renderer'

const PORT = process.env['HTTP_PORT'] || 3000
const partialMap = new Map<string, string>()

function startHttpServer() {
    const server = Bun.serve({
        port: PORT,
        async fetch(req) {
            const url = new URL(req.url)
            const { pathname } = url
            if (pathname === '/partial') {
                const itemId = url.search.slice(1)
                if (partialMap.has(itemId)) {
                    const content = partialMap.get(itemId)
                    partialMap.delete(itemId)
                    return new Response(content, { headers: { 'Content-Type': 'text/html' } })
                } else {
                    return new Response(null, { status: 404 })
                }
            } else if (pathname === '/trigger') {
                const handlerId = url.search.slice(1)
                const { status, data, error } = renderer.triggerEvent(handlerId)
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
                    return new Response(JSON.stringify({ status: 'success', data: data && JSON.parse(data) }), {
                        headers: jsonHeader
                    })
                }
            }
            const jsxPath = join(import.meta.dir, '../../app/server', pathname, 'Page.jsx')
            const jsxFile = Bun.file(jsxPath)
            if (await jsxFile.exists()) {
                const html = await renderer.renderJSX(jsxPath)
                return new Response(html, { headers: { 'Content-Type': 'text/html' } })
            }
            const filename = pathname === '/' ? '/index.html' : pathname
            const file = Bun.file(join(import.meta.dir, '../../app/public', filename))
            if (await file.exists()) {
                return new Response(file)
            }
            const distFile = Bun.file(join(import.meta.dir, '../../app/dist', filename))
            if (await distFile.exists()) {
                return new Response(distFile)
            }
            return new Response('Not Found', { status: 404 })
        }
    })
    console.log(`http server running at http://${server.hostname}:${server.port}`)
}

export const http = {
    startServer: startHttpServer,
    registerPartial(itemId: string, output: string) {
        partialMap.set(itemId, output)
        setTimeout(() => partialMap.delete(itemId), 60_000)
    }
}

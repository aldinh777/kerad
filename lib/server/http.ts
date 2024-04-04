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
                const result = renderer.triggerEvent(handlerId, await req.text())
                switch (result) {
                    case 'ok':
                        return new Response('ok')
                    case 'not found':
                        return new Response('not found', { status: 404 })
                    default:
                        return new Response('error', { status: 500 })
                }
            } else if (pathname === '/submit') {
                const handlerId = url.search.slice(1)
                const result = renderer.submitForm(handlerId, await req.formData())
                switch (result) {
                    case 'ok':
                        return new Response('ok')
                    case 'not found':
                        return new Response('not found', { status: 404 })
                    default:
                        return new Response('error', { status: 500 })
                }
            }
            const jsxPath = join(import.meta.dir, '../../app/server', pathname, 'page.jsx')
            const jsxFile = Bun.file(jsxPath)
            if (await jsxFile.exists()) {
                const resData: any = { headers: { 'Content-Type': 'text/html' } }
                const html = await renderer.renderLayout(jsxPath, req, resData)
                return new Response(html, resData)
            }
            const filename = pathname === '/' ? '/index.html' : pathname
            const file = Bun.file(join(import.meta.dir, '../../app/static', filename))
            if (await file.exists()) {
                return new Response(file)
            }
            const buildFile = Bun.file(join(import.meta.dir, '../../build', filename))
            if (await buildFile.exists()) {
                return new Response(buildFile)
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

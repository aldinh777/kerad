import { join } from 'path'
import { renderer } from './renderer'

const PORT = process.env['HTTP_PORT'] || 3000
const partialMap = new Map<string, { content: string; connectionSet: Set<string> }>()

function startHttpServer() {
    const server = Bun.serve({
        port: PORT,
        async fetch(req) {
            const url = new URL(req.url)
            const { pathname } = url
            if (pathname === '/partial') {
                const partialId = url.search.slice(1)
                const connectionId = req.headers.get('Connection-ID')
                if (!partialMap.has(partialId)) {
                    return new Response('not found', { status: 404 })
                }
                const { content, connectionSet } = partialMap.get(partialId)!
                if (connectionId && connectionSet.has(connectionId)) {
                    return new Response(content, { headers: { 'Content-Type': 'text/html' } })
                } else {
                    return new Response('unauthorized', { status: 401 })
                }
            } else if (pathname === '/trigger') {
                const handlerId = url.search.slice(1)
                if (req.method !== 'POST') {
                    return new Response('not allowed', { status: 405 })
                }
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
                const [contentType] = req.headers.get('Content-Type')?.split(';') || []
                if (!(req.method === 'POST' && contentType === 'multipart/form-data')) {
                    return new Response('invalid', { status: 400 })
                }
                const formData = await req.formData()
                const result = renderer.submitForm(handlerId, formData)
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
    registerPartial(partialId: string, output: string, connectionSet: Set<string>) {
        partialMap.set(partialId, { content: output, connectionSet })
    },
    unregisterPartial(partialId: string) {
        partialMap.delete(partialId)
    }
}

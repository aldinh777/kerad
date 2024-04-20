import { join } from 'path'
import * as registry from './registry'
import * as renderer from './renderer'
import * as routing from './routing'

const PORT = process.env['HTTP_PORT'] || 3000

export function startHttpServer() {
    const server = Bun.serve({
        port: PORT,
        async fetch(req) {
            const url = new URL(req.url)
            const { pathname } = url
            if (pathname === '/port-data') {
                return Response.json({
                    HTTP: PORT,
                    WS: process.env['WS_PORT'] || 3100,
                    WSRELOAD: process.env['WSRELOAD_PORT'] || 3101
                })
            } else if (pathname === '/partial') {
                const partialId = url.search.slice(1)
                const connectionId = req.headers.get('Connection-ID')
                const { result, content } = registry.renderPartial(partialId, connectionId)
                switch (result) {
                    case 'ok':
                        return new Response(content, { headers: { 'Content-Type': 'text/html' } })
                    case 'not found':
                        return new Response('not found', { status: 404 })
                    case 'unauthorized':
                        return new Response('unauthorized', { status: 401 })
                    default:
                        return new Response('error', { status: 500 })
                }
            } else if (pathname === '/trigger') {
                const handlerId = url.search.slice(1)
                if (req.method !== 'POST') {
                    return new Response('not allowed', { status: 405 })
                }
                const result = registry.triggerHandler(handlerId, await req.text())
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
                const result = registry.submitForm(handlerId, formData)
                switch (result) {
                    case 'ok':
                        return new Response('ok')
                    case 'not found':
                        return new Response('not found', { status: 404 })
                    default:
                        return new Response('error', { status: 500 })
                }
            }
            const filename = pathname === '/' ? '/index.html' : pathname
            const file = Bun.file(join(import.meta.dir, '../app/static', filename))
            if (await file.exists()) {
                return new Response(file)
            }
            const buildFile = Bun.file(join(import.meta.dir, '../build', filename))
            if (await buildFile.exists()) {
                return new Response(buildFile)
            }
            const rootPath = join(import.meta.dir, '../app/server')
            const page = await routing.parseRouting(rootPath, pathname, req)
            if (page.status === 'page') {
                const htmlOutput = await renderer.renderPage(page.layout, page.component, page.context)
                return new Response(htmlOutput, page.context.data.response)
            } else if (page.status === 'response') {
                return page.response
            }
            return new Response('Not Found', { status: 404 })
        }
    })
    console.log(`http server running at http://${server.hostname}:${server.port}`)
}

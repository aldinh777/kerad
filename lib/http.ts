import type { Server } from 'bun'
import * as routing from './routing'
import { serveSSE } from './sse'

const PORT = Bun.env['HTTP_PORT'] || 3000

export function startHttpServer() {
    const server: Server = Bun.serve({
        port: PORT,
        async fetch(req) {
            const url = new URL(req.url)
            const { pathname, searchParams } = url
            switch (pathname) {
                case '/rekt/events':
                    const cid = searchParams.get('cid')!
                    return serveSSE(req, cid)
                case '/rekt/partial':
                    const partialId = searchParams.get('id')!
                    const connectionId = req.headers.get('Connection-ID')!
                    return routing.handlePartial(partialId, connectionId)
                case '/rekt/trigger':
                    if (req.method !== 'POST') {
                        return new Response('not allowed', { status: 405 })
                    }
                    const triggerId = searchParams.get('id')!
                    const body = await req.text()
                    return routing.handleTrigger(triggerId, body)
                case '/rekt/submit':
                    const formId = searchParams.get('id')!
                    const [contentType] = req.headers.get('Content-Type')?.split(';') || []
                    if (!(req.method === 'POST' && contentType === 'multipart/form-data')) {
                        return new Response('invalid', { status: 400 })
                    }
                    const formData = await req.formData()
                    return routing.handleSubmit(formId, formData)
                default:
                    const fileResponse = await routing.handleStaticFile(pathname)
                    if (fileResponse) {
                        return fileResponse
                    }
                    return await routing.routeUrl(req, url)
            }
        }
    })
    console.log(`http server running at http://${server.hostname}:${server.port}`)
}

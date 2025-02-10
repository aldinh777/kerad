import { serve } from 'bun';
import { handlePartial, handleTrigger, handleSubmit, routeUrl, handleStaticFile } from './routing.ts';
import { ws } from './ws.ts';

const PORT = process.env['HTTP_PORT'] || 3000;

export function startServer() {
    const server = serve({
        port: PORT,
        async fetch(req) {
            const url = new URL(req.url);
            const { pathname, searchParams } = url;
            switch (pathname) {
                case '/connect':
                    const cid = url.searchParams.get('cid');
                    if (!cid) {
                        return new Response('invalid', { status: 400 });
                    }
                    const upgrade = server.upgrade(req, { data: { cid } });
                    if (upgrade) {
                        return new Response(null, { status: 101 });
                    } else {
                        return new Response('upgrade failed :(', { status: 500 });
                    }
                case '/kerad/partial':
                    const partialId = searchParams.get('id')!;
                    const connectionId = req.headers.get('Connection-ID')!;
                    return handlePartial(partialId, connectionId);
                case '/kerad/trigger':
                    if (req.method !== 'POST') {
                        return new Response('not allowed', { status: 405 });
                    }
                    const triggerId = searchParams.get('id')!;
                    return handleTrigger(triggerId, req.text());
                case '/kerad/submit':
                    const formId = searchParams.get('id')!;
                    const [contentType] = req.headers.get('Content-Type')?.split(';') || [];
                    if (!(req.method === 'POST' && contentType === 'multipart/form-data')) {
                        return new Response('invalid', { status: 400 });
                    }
                    return handleSubmit(formId, req.formData());
                default:
                    const fileResponse = await handleStaticFile(pathname);
                    if (fileResponse) {
                        return fileResponse;
                    }
                    return routeUrl(req, url);
            }
        },
        websocket: ws.socketHandler
    });
    ws.server = server;

    console.log(`http & websocket server running at http://${server.hostname}:${server.port}`);
}

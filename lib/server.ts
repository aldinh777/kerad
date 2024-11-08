import { serve } from 'bun';
import { Hono } from '@hono/hono';
import { serveStatic } from '@hono/hono/bun';
import { handlePartial, handleTrigger, handleSubmit, routeUrl } from './routing.ts';
import { ws } from './ws.ts';

const app = new Hono();

const PORT = process.env['HTTP_PORT'] || 3000;

app.get('/kerad/partial', (c) => {
    const partialId = c.req.query('id') || '';
    const connectionId = (c.req.header('Connection-ID') as string) || '';
    return handlePartial(partialId, connectionId);
});

app.post('/kerad/trigger', (c) => {
    const triggerId = c.req.query('id') || '';
    const body = c.req.text();
    return handleTrigger(triggerId, body);
});

app.post('/kerad/submit', (c) => {
    const formId = c.req.query('id') || '';
    const contentType = c.req.header('Content-Type')?.split(';')[0];
    if (!(contentType === 'multipart/form-data')) {
        return new Response('invalid', { status: 400 });
    }
    const formData = c.req.formData();
    return handleSubmit(formId, formData);
});

app.use(serveStatic({ root: './build' }));
app.use(serveStatic({ root: './app/public' }));

app.use(routeUrl);

export function startServer() {
    const server = serve({
        async fetch(req, server) {
            const res = ws.fetch(req, server);
            return res || (await app.fetch(req, server));
        },
        port: PORT,
        websocket: ws.socketHandler
    });
    ws.server = server;

    console.log(`http server running at http://${server.hostname}:${server.port}`);
}

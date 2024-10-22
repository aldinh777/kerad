import { Hono } from '@hono/hono';
import { serveStatic } from '@hono/hono/bun';
import { handlePartial, handleTrigger, handleSubmit, routeUrl } from './routing.ts';

const app = new Hono();

const PORT = process.env['HTTP_PORT'] || 3000;

app.get('/kerad/port-data', async (c) => {
    return c.json({
        HTTP: PORT,
        WS: process.env['WS_PORT'] || 3100,
        WSRELOAD: process.env['WSRELOAD_PORT'] || 3101
    });
});

app.get('/kerad/partial', async (c) => {
    const partialId = c.req.query('id') || '';
    const connectionId = (c.req.header('Connection-ID') as string) || '';
    return handlePartial(partialId, connectionId);
});

app.post('/kerad/trigger', async (c) => {
    const triggerId = c.req.query('id') || '';
    const body = await c.req.text();
    return handleTrigger(triggerId, body);
});

app.post('/kerad/submit', async (c) => {
    const formId = c.req.query('id') || '';
    const contentType = c.req.header('Content-Type')?.split(';')[0];
    if (!(contentType === 'multipart/form-data')) {
        return new Response('invalid', { status: 400 });
    }
    const formData = await c.req.formData();
    return handleSubmit(formId, formData);
});

app.use(serveStatic({ root: './build' }));
app.use(serveStatic({ root: './app/public' }));

app.use(routeUrl);

console.log(`http server running at http://localhost:3000`);

export default {
    port: PORT,
    fetch: app.fetch
};

import type { Context } from '@hono/hono';
import { CryptoHasher, file } from 'bun';
import { join } from 'path';
import { readdir } from 'fs/promises';
import { registerConnection, renderPartial, submitForm, triggerHandler } from '@aldinh777/kerad-core';
import { renderPage } from './renderer.ts';

export const ROUTE_PATH = join(import.meta.dir, '../app/server');

async function md5HashImport(filename: string) {
    const hasher = new CryptoHasher('md5');
    const componentFile = file(filename);
    hasher.update(await componentFile.arrayBuffer());
    const checksum = hasher.digest('hex');
    filename += '?checksum=' + checksum;
    return await import(filename);
}

function responseFromStatus(status: string, payload: any = null) {
    switch (status) {
        case 'ok':
            return new Response(payload, { status: 200 });
        case 'not found':
            return new Response(payload, { status: 404 });
        case 'unauthorized':
            return new Response(payload, { status: 401 });
        case 'partial':
            return new Response(payload, { headers: { 'Content-Type': 'text/html' } });
        default:
            return new Response(payload, { status: 500 });
    }
}

export async function handlePartial(partialId: string, connectionId: string) {
    const { result, content } = renderPartial(partialId, connectionId);
    return responseFromStatus(result, await content);
}

export async function handleTrigger(triggerId: string, value: Promise<string>) {
    const { result, error } = triggerHandler(triggerId, await value);
    return responseFromStatus(result, error);
}

export async function handleSubmit(formId: string, formData: Promise<FormData>) {
    const { result, error } = submitForm(formId, await formData);
    return responseFromStatus(result, error);
}

export async function handleStaticFile(pathname: string) {
    const filename = pathname === '/' ? '/index.html' : pathname;
    const staticFile = file(join(import.meta.dir, '../app/static', filename));
    if (await staticFile.exists()) {
        return new Response(staticFile);
    }
    const buildFile = file(join(import.meta.dir, '../build', filename));
    if (await buildFile.exists()) {
        return new Response(buildFile);
    }
}

export async function routeUrl(connection: Context): Promise<Response> {
    const path = connection.req.path;
    const pathname = path.endsWith('/') ? path : path + '/';
    const layoutStack: string[] = [];
    const context = registerConnection(connection);
    let dir = ROUTE_PATH;
    let url = '';

    for (let i = 0; i < pathname.length; i++) {
        const c = pathname[i];
        if (c !== '/') {
            url += c;
            continue;
        }

        let nextDir = join(dir, url);
        let dirItems: string[];

        try {
            dirItems = await readdir(nextDir);
        } catch (err: any) {
            const parentItems = await readdir(dir);
            const paramDir = parentItems.find((item) => item.startsWith('[') && item.endsWith(']'));
            if (paramDir) {
                nextDir = join(dir, paramDir);
                dirItems = await readdir(nextDir);
                if (paramDir.startsWith('[...')) {
                    const paramName = paramDir.slice(4, -1);
                    const restOfUrl = pathname.slice(i, -1);
                    context.params[paramName] = decodeURI(url + restOfUrl);
                    i = pathname.length;
                } else {
                    const paramName = paramDir.slice(1, -1);
                    context.params[paramName] = decodeURI(url);
                }
            } else {
                return responseFromStatus('not found');
            }
        }

        url = '';
        dir = nextDir;

        if (dirItems.includes('layout.html')) {
            layoutStack.push(join(dir, 'layout.html'));
        }

        if (dirItems.includes('middleware.ts')) {
            const middlewareFile = join(dir, 'middleware.ts');
            const middleware = await md5HashImport(middlewareFile);
            const res = await middleware.default(context);
            if (res) {
                return res as Response;
            }
        }
    }

    const pagePath = join(dir, 'page.tsx');
    const pageFile = file(pagePath);
    if (await pageFile.exists()) {
        const htmlLayout = await layoutStack.reduce(
            (html, path) =>
                html.then((html) =>
                    file(path)
                        .text()
                        .then((text) => html.replace('%PAGE%', text))
                ),
            Promise.resolve('%PAGE%')
        );
        const component = await md5HashImport(pagePath);
        const renderOutput = await renderPage(htmlLayout, component, context);
        if (renderOutput instanceof Response) {
            return renderOutput;
        }
        return context.connection.html(renderOutput);
    }
    return responseFromStatus('error', 'page not found');
}

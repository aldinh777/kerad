import type { Context } from '@hono/hono';
import { join } from 'path';
import { readdir } from 'fs/promises';
import { registerConnection, renderPartial, submitForm, triggerHandler } from '@aldinh777/kerad-core';
import { renderPage } from './renderer.ts';

export const ROUTE_PATH = join(import.meta.dir, '../app/server');

async function md5HashImport(filename: string) {
    const hasher = new Bun.CryptoHasher('md5');
    const file = Bun.file(filename);
    hasher.update(await file.arrayBuffer());
    const checksum = hasher.digest('hex');
    filename += '?checksum=' + checksum;
    return await import(filename);
}

function responseFromStatus(status: string, data?: any) {
    switch (status) {
        case 'ok':
            return new Response('ok');
        case 'not found':
            return new Response('not found', { status: 404 });
        case 'unauthorized':
            return new Response('unauthorized', { status: 401 });
        case 'partial':
            return new Response(data, { headers: { 'Content-Type': 'text/html' } });
        // @ts-ignore
        case 'error':
            console.error(data);
        default:
            return new Response('error', { status: 500 });
    }
}

export function handlePartial(partialId: string, connectionId: string) {
    const { result, content } = renderPartial(partialId, connectionId);
    return responseFromStatus(result, content);
}

export function handleTrigger(triggerId: string, value: string) {
    const { result, error } = triggerHandler(triggerId, value);
    return responseFromStatus(result, error);
}

export function handleSubmit(formId: string, formData: FormData) {
    const { result, error } = submitForm(formId, formData);
    return responseFromStatus(result, error);
}

export async function handleStaticFile(pathname: string) {
    const filename = pathname === '/' ? '/index.html' : pathname;
    const file = Bun.file(join(import.meta.dir, '../app/static', filename));
    if (await file.exists()) {
        return new Response(file);
    }
    const buildFile = Bun.file(join(import.meta.dir, '../build', filename));
    if (await buildFile.exists()) {
        return new Response(buildFile);
    }
}

export async function routeUrl(connection: Context): Promise<Response> {
    const pathname = connection.req.path.endsWith('/') ? connection.req.path : connection.req.path + '/';
    const urlArray = pathname === '/' ? [''] : pathname.split('/');
    const layoutStack: string[] = [];
    const context = registerConnection(connection);
    let routeDir = ROUTE_PATH;

    const restStack = [];
    let restFlag = false;
    let restName = '';
    for (const urlPath of urlArray) {
        if (restFlag) {
            restStack.push(urlPath);
            continue;
        }

        const items = await readdir(routeDir);

        // push any layout.html if there is any
        if (items.includes('layout.html')) {
            layoutStack.push(join(routeDir, 'layout.html'));
        }

        // execute and return middleware response if there is any
        if (items.includes('middleware.ts')) {
            const middlewareFile = join(routeDir, 'middleware.ts');
            const middleware = await md5HashImport(middlewareFile);
            const res = await middleware.default(context);
            if (res) {
                return res as Response;
            }
        }

        // skip if the current urlPath is '', indicating the root path
        if (!urlPath) {
            continue;
        }

        // find the next directory to check and compare with the url
        // if current directory has exactly a subdirectory with the same name as the path in the url
        if (items.includes(urlPath)) {
            routeDir = join(routeDir, urlPath);
            continue;
        }

        // check for each subdirectories if there is any [param] or [...param] like subdirectory
        let noMatch = true;
        for (const item of items.filter((item) => item.startsWith('[') && item.endsWith(']'))) {
            const match = item.match(/\[(\.{3})?([$\w\d+-]+)\]/);
            if (match) {
                const [, isRest, param] = match;
                if (isRest) {
                    restFlag = true;
                    restName = param;
                    restStack.push(decodeURI(urlPath));
                } else {
                    context.params[param] = decodeURI(urlPath);
                }
                routeDir = join(routeDir, item);
                noMatch = false;
                break;
            }
        }

        if (noMatch) {
            return new Response('not found', { status: 404 });
        }
    }
    if (restFlag) {
        context.params[restName] = decodeURI(restStack.join('/'));
    }
    const pageFilePath = join(routeDir, 'page.tsx');
    const pageFile = Bun.file(pageFilePath);
    if (await pageFile.exists()) {
        const htmlLayout = await layoutStack.reduce(
            (html, path) =>
                html.then((html) =>
                    Bun.file(path)
                        .text()
                        .then((text) => html.replace('%PAGE%', text))
                ),
            Promise.resolve('%PAGE%')
        );
        const component = await md5HashImport(pageFilePath);
        const renderOutput = await renderPage(htmlLayout, component, context);
        return context.connection.html(renderOutput);
    }
    return new Response('not found', { status: 404 });
}

import type { ServerContext } from '@aldinh777/kerad';
import { CryptoHasher, file } from 'bun';
import { join } from 'path';
import { readdir } from 'fs/promises';
import { registerConnection, renderPartial, submitForm, triggerHandler } from '@aldinh777/kerad';
import { renderPage } from './renderer.ts';

interface MiddlewareRules {
    default?(context: ServerContext): Promise<Response | undefined>;
    all?(): Promise<Response | undefined>;
    get?(): Promise<Response | undefined>;
    post?(): Promise<Response | undefined>;
    put?(): Promise<Response | undefined>;
    del?(): Promise<Response | undefined>;
    patch?(): Promise<Response | undefined>;
    notFound?(): Promise<Response | undefined>;
    error?(): Promise<Response | undefined>;
}

export const ROUTE_PATH = join(import.meta.dir, '../app');

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
            return new Response(payload instanceof Error ? payload.stack || payload.message : payload, { status: 500 });
    }
}

export async function handlePartial(partialId: string, connectionId: string) {
    const { result, content } = renderPartial(partialId, connectionId);
    return responseFromStatus(result, await content);
}

export async function handleTrigger(triggerId: string, value: Promise<string>) {
    const { result, error } = await triggerHandler(triggerId, await value);
    if (error) {
        console.error(error);
    }
    return responseFromStatus(result, error);
}

export async function handleSubmit(formId: string, formData: Promise<FormData>) {
    const { result, error } = await submitForm(formId, await formData);
    if (error) {
        console.error(error);
    }
    return responseFromStatus(result, error);
}

export async function handleStaticFile(pathname: string) {
    const filename = pathname === '/' ? '/index.html' : pathname;
    const staticFile = file(join(import.meta.dir, '../public', filename));
    if (await staticFile.exists()) {
        return new Response(staticFile);
    }
    const buildFile = file(join(import.meta.dir, '../build', filename));
    if (await buildFile.exists()) {
        return new Response(buildFile);
    }
}

export async function routeUrl(req: Request, url: URL): Promise<Response> {
    const path = url.pathname;
    const pathname = path.endsWith('/') ? path : path + '/';
    const layoutStack: string[] = [];
    const context = registerConnection(req, url);
    let dir = ROUTE_PATH;
    let urlMatch = '';
    let notFoundPath = '';
    let errorPath = '';
    let notFoundHandler: (() => Promise<Response | undefined>) | undefined;
    let errorHandler: (() => Promise<Response | undefined>) | undefined;

    for (let i = 0; i < pathname.length; i++) {
        const c = pathname[i];
        if (c !== '/') {
            urlMatch += c;
            continue;
        }

        let nextDir = join(dir, urlMatch);
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
                    context.params[paramName] = decodeURI(urlMatch + restOfUrl);
                    i = pathname.length;
                } else {
                    const paramName = paramDir.slice(1, -1);
                    context.params[paramName] = decodeURI(urlMatch);
                }
            } else {
                const res = await notFoundHandler?.();
                if (res instanceof Response) {
                    return res;
                }
                let page = null;
                if (notFoundPath) {
                    const notFoundPage = file(notFoundPath);
                    page = (await notFoundPage.exists()) ? notFoundPage : null;
                }
                return responseFromStatus('not found', page);
            }
        }

        urlMatch = '';
        dir = nextDir;

        if (dirItems.includes('layout.html')) {
            layoutStack.push(join(dir, 'layout.html'));
        }

        if (dirItems.includes('not-found.html')) {
            notFoundPath = join(dir, 'not-found.html');
        }

        if (dirItems.includes('error.html')) {
            errorPath = join(dir, 'error.html');
        }

        if (dirItems.includes('rules.ts')) {
            const rulesFile = join(dir, 'rules.ts');
            const rules: MiddlewareRules = await md5HashImport(rulesFile);
            const method = req.method;
            if (rules.notFound) {
                notFoundHandler = rules.notFound;
            }
            if (rules.error) {
                errorHandler = rules.error;
            }
            let res: Response | undefined = await rules.default?.(context);
            if (res instanceof Response) {
                return res;
            }
            switch (method) {
                case 'GET':
                    res = await rules.get?.();
                    break;
                case 'POST':
                    res = await rules.post?.();
                    break;
                case 'PUT':
                    res = await rules.put?.();
                    break;
                case 'PATCH':
                    res = await rules.patch?.();
                    break;
                case 'DELETE':
                    res = await rules.del?.();
                    break;
            }
            if (res instanceof Response) {
                return res;
            }
            res = await rules.all?.();
            if (res instanceof Response) {
                return res;
            }
        }
    }

    const pagePath = join(dir, 'page.tsx');
    const pageFile = file(pagePath);
    if (await pageFile.exists()) {
        try {
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
            return new Response(renderOutput, {
                status: context.res.status,
                headers: context.res.headers as HeadersInit
            });
        } catch (err) {
            const res = await errorHandler?.();
            if (res instanceof Response) {
                return res;
            }
            if (errorPath) {
                const errorPage = file(errorPath);
                const page = await errorPage.text().then((html) => {
                    const stackTrace = err instanceof Error ? err.stack : err;
                    console.error(err);
                    return html.replace('%STACK_TRACE%', String(stackTrace));
                });

                if (!page) {
                    throw err;
                }

                return new Response(page, { status: 500, headers: { 'Content-Type': 'text/html' } });
            }
            throw err;
        }
    } else if (notFoundPath) {
        const notFoundPage = file(notFoundPath);
        const page = (await notFoundPage.exists()) ? notFoundPage : null;
        return responseFromStatus('not found', page);
    }
    return responseFromStatus('error', 'page not found');
}

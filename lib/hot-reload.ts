import { join, relative } from 'path';
import { watch } from 'fs';

declare global {
    var hotReloadWatched: boolean;
}

const WATCH_DIRS = ['../app', '../lib', '../main.ts'];

export function startHotReloadServer() {
    const server = Bun.serve({
        port: process.env['WSRELOAD_PORT'] || 3101,
        fetch(req, server) {
            const upgrade = server.upgrade(req);
            if (!upgrade) {
                return new Response('Upgrade failed :(', { status: 500 });
            }
        },
        websocket: {
            message() {},
            open: (socket) => socket.subscribe('hr'),
            close: (socket) => socket.unsubscribe('hr')
        }
    });

    if (!globalThis.hotReloadWatched) {
        console.log('hot reload enabled, watching : ');
        for (const path of WATCH_DIRS) {
            const dir = join(import.meta.dir, path);
            console.log(`(+) ${relative(process.cwd(), dir)}`);
        }
        for (const path of WATCH_DIRS) {
            const dir = join(import.meta.dir, path);
            watch(dir, { recursive: true }, () => server.publish('hr', 'r'));
        }
        globalThis.hotReloadWatched = true;
    }
}

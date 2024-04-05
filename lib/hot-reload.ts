import { join, relative } from 'path'
import { watch } from 'fs'

const server = Bun.serve({
    port: 3101,
    fetch(req, server) {
        const upgrade = server.upgrade(req)
        if (!upgrade) {
            return new Response('Upgrade failed :(', { status: 500 })
        }
    },
    websocket: {
        message() {},
        open: (socket) => socket.subscribe('hr'),
        close: (socket) => socket.unsubscribe('hr')
    }
})

declare global {
    var hotReloadWatched: boolean
}

const watchDirs = ['../app', '../lib', '../main.ts']
console.log('hot reload enabled, watching : ')
for (const path of watchDirs) {
    const dir = join(import.meta.dir, path)
    console.log(`(+) ${relative(process.cwd(), dir)}`)
}

if (!globalThis.hotReloadWatched) {
    for (const path of watchDirs) {
        const dir = join(import.meta.dir, path)
        watch(dir, { recursive: true }, () => server.publish('hr', 'r'))
    }
    globalThis.hotReloadWatched = true
}

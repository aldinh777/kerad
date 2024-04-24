import { join, relative } from 'path'
import { watch } from 'fs'
import { pushRedirect } from './sse'

declare global {
    var hotReloadWatched: boolean
}

const WATCH_DIRS = ['../app', '../lib', '../main.ts']

export function watchAndReload() {
    if (!globalThis.hotReloadWatched) {
        console.log('hot reload enabled, watching : ')
        for (const path of WATCH_DIRS) {
            const dir = join(import.meta.dir, path)
            console.log(`(+) ${relative(process.cwd(), dir)}`)
        }
        for (const path of WATCH_DIRS) {
            const dir = join(import.meta.dir, path)
            watch(dir, { recursive: true }, () => pushRedirect('*'))
        }
        globalThis.hotReloadWatched = true
    }
}

import { join, relative } from 'path'
import { watch } from 'fs'
import { readdir, rm } from 'fs/promises'

const SCRIPT_ENTRY = join(import.meta.dir, '../app/client/init.ts')
const CLIENT_PATH = join(import.meta.dir, '../app/client')
const OUTPUT_DIR = join(import.meta.dir, '../build')
const BUNDLE_WATCH_DIRS = ['../app/client']

declare global {
    var bundleWatched: boolean
}

async function bundle(updated?: string) {
    await rm(OUTPUT_DIR, { recursive: true, force: true })
    const files = await readdir(CLIENT_PATH, { recursive: true })

    await Bun.build({
        entrypoints: [
            SCRIPT_ENTRY,
            ...files.filter((file) => file.endsWith('.tsx')).map((tsx) => join(CLIENT_PATH, tsx))
        ],
        outdir: OUTPUT_DIR,
        splitting: true
    })
    if (updated) {
        console.log(`update at ${updated}, bundle recompiled`)
    } else {
        console.log('bundle compiled')
    }
}

export function watchBundle() {
    bundle()
    console.log('hot bundling at : ')
    for (const path of BUNDLE_WATCH_DIRS) {
        const dir = join(import.meta.dir, path)
        console.log(`(+) ${relative(process.cwd(), dir)}`)
    }
    if (!globalThis.bundleWatched) {
        for (const path of BUNDLE_WATCH_DIRS) {
            const dir = join(import.meta.dir, path)
            watch(dir, (_type, file) => bundle(file!))
            globalThis.bundleWatched = true
        }
    }
}

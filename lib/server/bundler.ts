import { join, relative } from 'path'
import { watch } from 'fs'
import { readdir, rm } from 'fs/promises'

const entry = join(import.meta.dir, '../client/init.ts')
const clientPath = join(import.meta.dir, '../../app/client')
const outDir = join(import.meta.dir, '../../app/dist')

async function bundle(updated?: string) {
    await rm(outDir, { recursive: true, force: true })
    const files = await readdir(clientPath, { recursive: true })

    await Bun.build({
        entrypoints: [entry],
        outdir: './app/dist',
        splitting: true
    })
    await Bun.build({
        entrypoints: files.filter((file) => file.endsWith('.jsx')).map((jsx) => join(clientPath, jsx)),
        outdir: './app/dist',
        splitting: true
    })
    if (updated) {
        console.log(`update at ${updated}, bundle recompiled`)
    } else {
        console.log('bundle compiled')
    }
}

const watchDirs = ['../client', '../../app/client']
console.log('hot bundling at : ')
for (const path of watchDirs) {
    const dir = join(import.meta.dir, path)
    console.log(`(+) ${relative(process.cwd(), dir)}`)
}

declare global {
    var bundleWatched: boolean
}

if (!globalThis.bundleWatched) {
    for (const path of watchDirs) {
        const dir = join(import.meta.dir, path)
        watch(dir, (_type, file) => bundle(file!))
        globalThis.bundleWatched = true
    }
}

bundle()

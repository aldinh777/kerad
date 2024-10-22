import { join, relative } from 'path';
import { watch } from 'fs';
import { readdir, rm } from 'fs/promises';
import { pushRedirect } from './ws';

const SCRIPT_ENTRY = join(import.meta.dir, '../app/client/init.ts');
const CLIENT_PATH = join(import.meta.dir, '../app/client');
const OUTPUT_DIR = join(import.meta.dir, '../build');
const BUNDLE_WATCH_DIRS = ['../app/client'];

declare global {
    var hotBundle: boolean;
    var hotReload: boolean;
}

async function bundle(updated?: string) {
    await rm(OUTPUT_DIR, { recursive: true, force: true });
    const files = await readdir(CLIENT_PATH, { recursive: true });
    const watched = files.filter((file) => file.endsWith('.tsx')).map((tsx) => join(CLIENT_PATH, tsx));

    const res = await Bun.build({
        entrypoints: [SCRIPT_ENTRY, ...watched],
        outdir: OUTPUT_DIR,
        splitting: true
    });
    if (res.success === false) {
        console.error(...res.logs);
    } else if (updated) {
        console.log(`update at ${updated}, bundle recompiled`);
    } else {
        console.log('bundle compiled');
    }
}

export function hotBundling() {
    bundle();
    console.log('hot bundling at : ');
    for (const path of BUNDLE_WATCH_DIRS) {
        const dir = join(import.meta.dir, path);
        console.log(`(+) ${relative(process.cwd(), dir)}`);
    }
    if (!globalThis.hotBundle) {
        for (const path of BUNDLE_WATCH_DIRS) {
            const dir = join(import.meta.dir, path);
            watch(dir, (_type, file) => bundle(file!));
            globalThis.hotBundle = true;
        }
    }
}

const WATCH_DIRS = ['../app', '../lib', '../main.ts'];

export function hotReloading() {
    if (!globalThis.hotReload) {
        console.log('hot reload enabled, watching : ');
        for (const path of WATCH_DIRS) {
            const dir = join(import.meta.dir, path);
            console.log(`(+) ${relative(process.cwd(), dir)}`);
        }
        for (const path of WATCH_DIRS) {
            const dir = join(import.meta.dir, path);
            watch(dir, { recursive: true }, () => pushRedirect('hr', ''));
        }
        globalThis.hotReload = true;
    }
}

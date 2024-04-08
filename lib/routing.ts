import { join } from 'path'
import { readdir } from 'fs/promises'

type RouteResult =
    | {
          status: 'page'
          layout: string
          params: any
          page: any
      }
    | {
          status: 'not_found'
          info: string
      }
    | {
          status: 'response'
          response: Response
      }

async function md5HashImport(filename: string) {
    const hasher = new Bun.CryptoHasher('md5')
    const file = Bun.file(filename)
    hasher.update(await file.arrayBuffer())
    const checksum = hasher.digest('hex')
    filename += '?checksum=' + checksum
    return await import(filename)
}

async function parseRouting(root: string, path: string): Promise<RouteResult> {
    const paths = path.slice(1).split('/')
    const params: any = {}
    const layoutChains: string[] = []
    for (const pathname of paths) {
        let match = false
        const nextRoot = join(root, pathname)
        const dirs = await readdir(root)
        if (!pathname) {
            continue
        }
        if (dirs.includes('+layout.html')) {
            layoutChains.push(join(root, '+layout.html'))
        }
        for (const dir of dirs) {
            if (dir.startsWith('[') && dir.endsWith(']')) {
                const param = dir.slice(1, -1)
                params[param] = pathname
                root = join(root, dir)
                match = true
            } else if (dir === pathname) {
                root = nextRoot
                match = true
            }
        }
        if (!match) {
            return { status: 'not_found', info: 'url did not match any directory' }
        }
    }
    const res = await readdir(root)
    if (res.includes('+layout.html')) {
        layoutChains.push(join(root, '+layout.html'))
    }
    if (res.includes('+page.jsx')) {
        const pagePath = join(root, '+page.jsx')
        const layout = (
            await Promise.all(layoutChains.map((path) => Bun.file(path)).map((file) => file.text()))
        ).reduce((html, next) => html.replace('%SLOT%', next))
        const page = await md5HashImport(pagePath)
        return { status: 'page', layout: layout, page: page, params: params }
    }
    return { status: 'not_found', info: 'no +page.jsx file found' }
}

export const routing = {
    parseRouting: parseRouting
}

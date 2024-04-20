import type { ServerContext } from '@aldinh777/rekt-jsx/jsx-runtime'
import { join } from 'path'
import { readdir } from 'fs/promises'
import * as registry from './registry'
import * as ws from './ws'

type RouteResult =
    | {
          status: 'page'
          layout: string
          params: any
          component: any
          context: ServerContext
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

export async function parseRouting(root: string, path: string, req: Request): Promise<RouteResult> {
    const paths = path.slice(1).split('/')
    const params: any = {}
    const layoutChains: string[] = []
    const data: any = { params: params }
    const context = registry.createServerContext(req, data)
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
        if (dirs.includes('+middleware.ts')) {
            const middlewareFile = join(root, '+middleware.ts')
            const middleware = await md5HashImport(middlewareFile)
            const result = await middleware.default(context)
            if (result instanceof Response) {
                return { status: 'response', response: result }
            }
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
            return { status: 'not_found', info: "url didn't match any directory" }
        }
    }
    const res = await readdir(root)
    if (res.includes('+layout.html')) {
        layoutChains.push(join(root, '+layout.html'))
    }
    if (res.includes('+middleware.ts')) {
        const middlewareFile = join(root, '+middleware.ts')
        const middleware = await md5HashImport(middlewareFile)
        const result = await middleware.default(context)
        if (result instanceof Response) {
            return { status: 'response', response: result }
        }
    }
    if (res.includes('+page.tsx')) {
        const pagePath = join(root, '+page.tsx')
        const layout = (
            await Promise.all(layoutChains.map((path) => Bun.file(path)).map((file) => file.text()))
        ).reduce((html, next) => html.replace('%SLOT%', next))
        const component = await md5HashImport(pagePath)
        context.setHeader('Content-Type', 'text/html')
        context.data.sendRedirect = (url: string) => ws.pushRedirect(context.connectionId, url)
        return { status: 'page', layout: layout, component: component, params: params, context: context }
    }
    return { status: 'not_found', info: 'no +page.tsx file found' }
}

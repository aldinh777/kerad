import type { RektNode, RektProps, ServerContext } from '../common/jsx-runtime'
import { join } from 'path'
import { createHasher, md5Hash } from './hasher'
import { http } from './http'
import { ws } from './ws'

const hasher = createHasher({
    state(state, stateId, connectionMap) {
        return state.onChange((value) => {
            ws.pushStateChange(connectionMap.keys(), value, stateId)
        })
    },
    list(mappedList, listId, connectionMap) {
        const unsubWatch = mappedList.watch({
            async update(_index, { item, context }, prev) {
                const rendered = await renderToHtml(item, context)
                http.registerPartial(context.id, rendered)
                ws.pushListUpdate(connectionMap.keys(), context.id, prev.context.id)
            },
            async insert(index, { item, context }) {
                const rendered = await renderToHtml(item, context)
                const isLast = index >= mappedList().length - 1
                const insertBeforeId = isLast ? listId : mappedList(index + 1).context.id
                http.registerPartial(context.id, rendered)
                if (isLast) {
                    ws.pushListInsertLast(connectionMap.keys(), context.id, insertBeforeId)
                } else {
                    ws.pushListInsert(connectionMap.keys(), context.id, insertBeforeId)
                }
            },
            delete(_index, { context }) {
                ws.pushListDelete(connectionMap.keys(), context.id)
                context.dismount()
            }
        })
        return () => {
            unsubWatch()
            mappedList.stop()
            for (const { context } of mappedList()) {
                context.dismount()
            }
        }
    }
})

function renderProps(props: RektProps, context: ServerContext) {
    const reactiveProps: [prop: string, stateId: string][] = []
    const eventsProps: [event: string, handlerId: string][] = []
    let strProps = ''
    for (const prop in props) {
        const value = props[prop]
        if (prop === 'children') {
            continue
        } else if (prop.startsWith('on:')) {
            const eventName = prop.slice(3)
            eventsProps.push([eventName, hasher.registerHandler(value, context)])
        } else if (typeof value === 'function' && 'onChange' in value) {
            reactiveProps.push([prop, hasher.registerState(value, context)])
            strProps += ` ${prop}="${value()}"`
        } else {
            strProps += ` ${prop}="${value}"`
        }
    }
    if (reactiveProps.length) {
        strProps += ` rekt-p="${reactiveProps.map((p) => p.join(':')).join(' ')}"`
    }
    if (eventsProps.length) {
        strProps += ` rekt-t="${eventsProps.map((t) => t.join(':')).join(' ')}"`
    }
    return strProps
}

async function renderToHtml(item: RektNode | RektNode[], context: ServerContext): Promise<string> {
    if (item instanceof Array) {
        const htmlArray = await Promise.all(item.map((nested) => renderToHtml(nested, context)))
        return htmlArray.join('')
    } else if (typeof item === 'string') {
        return item
    } else if (typeof item === 'function') {
        if ('onChange' in item) {
            return `<rekt s="${hasher.registerState(item, context)}">${item()}</rekt>`
        } else if ('onUpdate' in item && 'onInsert' in item && 'onDelete' in item) {
            const listId = hasher.registerList(item, context)
            const childrenOutput = await Promise.all(
                item().map(async (value, index) => {
                    const context = hasher.getContext(item, index)
                    const content = await renderToHtml(value, context)
                    return `<rekt ib="${context.id}"></rekt>${content}<rekt ie="${context.id}"></rekt>`
                })
            )
            return `<rekt lb="${listId}"></rekt>${childrenOutput.join('')}<rekt le="${listId}"></rekt>`
        }
    } else if (typeof item === 'object' && 'tag' in item && 'props' in item) {
        const { tag, props } = item
        if (typeof tag === 'string') {
            if (props.children !== undefined) {
                const htmlOutput = await renderToHtml(props.children, context)
                return `<${tag}${renderProps(props, context)}>${htmlOutput}</${tag}>`
            } else {
                return `<${tag}${renderProps(props, context)}></${tag}>`
            }
        } else {
            return await renderToHtml(await tag(props, context), context)
        }
    }
    return String(item)
}

async function renderJsx(src: string, context: ServerContext) {
    src += '?checksum=' + (await md5Hash(src))
    const component = await import(src)
    try {
        const result = await component.default({}, context)
        return renderToHtml(result, context)
    } catch (error) {
        return `<pre>${error instanceof Error ? error.stack : error}</pre>`
    }
}

async function renderLayout(jsxPath: string, req: Request, responseData: any) {
    const file = Bun.file(join(import.meta.dir, '../../app/server', 'layout.html'))
    const html = await file.text()
    const context = hasher.generateContext(req, responseData)
    const jsxOutput = await renderJsx(jsxPath, context)
    return html
        .replace('%COMPONENT_ENTRY%', jsxOutput)
        .replace('%APP_TITLE%', process.env['APP_TITLE'] as string)
        .replace('%CONNECTION_ID%', context.id)
}

export const renderer = {
    renderLayout: renderLayout,
    triggerEvent: (handlerId: string) => hasher.triggerHandler(handlerId),
    unsubscribe: (contextId: string) => hasher.unsubscribe(contextId)
}

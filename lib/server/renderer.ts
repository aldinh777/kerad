import type { RektNode, RektProps, ServerContext } from '../common/jsx-runtime'
import type { State } from '@aldinh777/reactive'
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
                ws.pushListUpdate(connectionMap.keys(), listId, context.id, prev.context.id)
            },
            async insert(index, { item, context }) {
                const rendered = await renderToHtml(item, context)
                const isLast = index >= mappedList().length - 1
                const next = mappedList(index + 1)
                http.registerPartial(context.id, rendered)
                if (isLast) {
                    ws.pushListInsertLast(connectionMap.keys(), listId, context.id)
                } else {
                    ws.pushListInsert(connectionMap.keys(), listId, context.id, next.context.id)
                }
            },
            delete(_index, { context }) {
                ws.pushListDelete(connectionMap.keys(), listId, context.id)
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

function isReactive(state: any): state is State {
    return typeof state === 'function' && 'onChange' in state
}

function renderProps(props: RektProps, context: ServerContext) {
    const reactiveProps: [prop: string, stateId: string][] = []
    const reactiveBinds: [prop: string, stateId: string][] = []
    const eventsProps: [event: string, handlerId: string][] = []
    let strProps = ''
    for (const prop in props) {
        const value = props[prop]
        if (prop === 'children') {
            continue
        } else if (prop.startsWith('bind:')) {
            const propName = prop.slice(5)
            if (isReactive(value)) {
                reactiveBinds.push([propName, hasher.registerState(value, context)])
                strProps += ` ${propName}="${value()}"`
            } else {
                strProps += ` ${propName}="${value}"`
            }
        } else if (prop.startsWith('on:')) {
            const eventName = prop.slice(3)
            eventsProps.push([eventName, hasher.registerHandler(value, context)])
        } else if (isReactive(value)) {
            reactiveProps.push([prop, hasher.registerState(value, context)])
            strProps += ` ${prop}="${value()}"`
        } else {
            strProps += ` ${prop}="${value}"`
        }
    }
    if (reactiveProps.length) {
        strProps += ` rekt-p="${reactiveProps.map((p) => p.join(':')).join(' ')}"`
    }
    if (reactiveBinds.length) {
        strProps += ` rekt-b="${reactiveBinds.map((p) => p.join(':')).join(' ')}"`
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
                    return `<rekt i="${context.id}">${content}</rekt>`
                })
            )
            return `<rekt l="${listId}">${childrenOutput.join('')}</rekt>`
        }
    } else if (typeof item === 'object' && 'tag' in item && 'props' in item) {
        const { tag, props } = item
        if (typeof tag === 'string') {
            if (tag === 'form' && typeof props['on:submit'] === 'function') {
                const submitHandler = props['on:submit']
                const formId = hasher.registerFormHandler(submitHandler, context)
                props['rekt-f'] = formId
                delete props['on:submit']
            }
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
    triggerEvent: (handlerId: string, value: string) => hasher.triggerHandler(handlerId, value),
    submitForm: (formId: string, data: FormData) => hasher.submitForm(formId, data),
    unsubscribe: (contextId: string) => hasher.unsubscribe(contextId)
}
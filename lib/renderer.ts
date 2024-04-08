import type { RektNode, RektProps, ServerContext } from '@aldinh777/rekt-jsx/jsx-runtime'
import type { State } from '@aldinh777/reactive'
import { hasher } from './hasher'
import { ws } from './ws'

hasher.setHandler({
    state(state, stateId, connectionMap) {
        return state.onChange((value) => {
            ws.pushStateChange(connectionMap.keys(), value, stateId)
        })
    },
    list(mappedList, listId, connectionMap) {
        const unsubWatch = mappedList.watch({
            async update(_index, { item, context }, prev) {
                const rendered = await renderToHtml(item, context)
                const partialId = `${listId}-${context.id}`
                hasher.registerPartial(partialId, rendered, new Set(connectionMap.keys()))
                context.onDismount(() => hasher.unregisterPartial(partialId))
                ws.pushListUpdate(connectionMap.keys(), listId, context.id, prev.context.id)
            },
            async insert(index, { item, context }) {
                const rendered = await renderToHtml(item, context)
                const isLast = index >= mappedList().length - 1
                const next = mappedList(index + 1)
                const partialId = `${listId}-${context.id}`
                hasher.registerPartial(partialId, rendered, new Set(connectionMap.keys()))
                context.onDismount(() => hasher.unregisterPartial(partialId))
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
                    const listItem = hasher.getListItem(item, index)
                    const content = await renderToHtml(value, listItem.context)
                    return `<rekt i="${listItem.context.id}">${content}</rekt>`
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

async function renderPage(layout: string, component: any, context: ServerContext): Promise<string> {
    const result = await component.default({}, context)
    const html = await renderToHtml(result, context)
    return layout
        .replace('%TITLE%', component.metadata?.title || 'Rekt Application')
        .replace('%CID%', context.connectionId)
        .replace('%SLOT%', html)
}

export const renderer = {
    renderPage: renderPage,
    triggerEvent: (handlerId: string, value: string) => hasher.triggerHandler(handlerId, value),
    submitForm: (formId: string, data: FormData) => hasher.submitForm(formId, data),
    renderPartial: (partialId: string, connectionId: string | null) => hasher.renderPartial(partialId, connectionId),
    unsubscribe: (contextId: string) => hasher.unsubscribe(contextId)
}

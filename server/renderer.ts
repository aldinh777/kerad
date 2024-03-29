import type { RektContext, RektNode, RektProps } from '../lib/jsx-runtime'
import { join } from 'path'
import { createHasher, md5Hash } from './hasher'
import { connectToHub } from '../lib/bun-worker-hub'
import { randomString } from '@aldinh777/toolbox/random'
import { maplist } from '@aldinh777/reactive/collection/list/map'

const hub = connectToHub({
    renderJSX: (jsxPath, connectionId) => renderLayout(jsxPath, connectionId),
    triggerEvent: (handlerId) => hasher.triggerHandler(handlerId),
    unsubscribe: async (connectionId) => hasher.unsubscribe(connectionId)
})

const hasher = createHasher({
    state(state, stateId, connectionSet) {
        return state.onChange((value) => {
            hub.fetch('ws', 'pushState', value, stateId, [...connectionSet])
        })
    },
    list(list, listId, connectionSet, context) {
        const mappedList = maplist(list, (item: RektNode | RektNode[]) => {
            return { item, id: randomString(6) }
        })
        const unsubUpdate = mappedList.onUpdate((_index, { item, id }) => {
            const rendered = renderToHTML(item, context)
            hub.fetch('http', 'registerPartial', id, rendered)
            hub.fetch('ws', 'pushListUpdate', id, [...connectionSet])
        })
        const unsubInsert = mappedList.onInsert((index, { item, id }) => {
            const rendered = renderToHTML(item, context)
            const isLast = index === mappedList().length - 1
            const insertBeforeId = isLast ? listId : mappedList(index + 1).id
            hub.fetch('http', 'registerPartial', id, rendered)
            if (isLast) {
                hub.fetch('ws', 'pushListInsertLast', id, insertBeforeId, [...connectionSet])
            } else {
                hub.fetch('ws', 'pushListInsert', id, insertBeforeId, [...connectionSet])
            }
        })
        const unsubDelete = mappedList.onDelete((_index, { id }) => {
            hub.fetch('ws', 'pushListDelete', id, [...connectionSet])
        })
        return {
            mappedList: mappedList,
            unsubscribe() {
                unsubUpdate()
                unsubInsert()
                unsubDelete()
                mappedList.stop()
            }
        }
    }
})

function renderProps(props: RektProps, context: RektContext) {
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

function renderToHTML(item: RektNode | RektNode[], context: RektContext): string {
    if (item instanceof Array) {
        return item.map((nested) => renderToHTML(nested, context)).join('')
    } else if (typeof item === 'string') {
        return item
    } else if (typeof item === 'function') {
        if ('onChange' in item) {
            return `<rekt s="${hasher.registerState(item, context)}">${item()}</rekt>`
        } else if ('onUpdate' in item && 'onInsert' in item && 'onDelete' in item) {
            const listId = hasher.registerList(item, context)
            return `<rekt lb="${listId}"></rekt>${item()
                .map((value, index) => {
                    const itemId = hasher.getItemId(item, index)
                    return `<rekt ib="${itemId}"></rekt>${renderToHTML(value, context)}<rekt ie="${itemId}"></rekt>`
                })
                .join('')}<rekt le="${listId}"></rekt>`
        }
    } else if (typeof item === 'object' && 'tag' in item && 'props' in item) {
        const { tag, props } = item
        if (typeof tag === 'string') {
            if (props.children !== undefined) {
                return `<${tag}${renderProps(props, context)}>${renderToHTML(props.children, context)}</${tag}>`
            } else {
                return `<${tag}${renderProps(props, context)} />`
            }
        } else {
            return renderToHTML(tag(props, context), context)
        }
    }
    return String(item)
}

async function renderJSX(src: string, context: RektContext) {
    src += '?checksum=' + (await md5Hash(src))
    const component = await import(src)
    const result = component.default({}, context)
    return renderToHTML(result, context)
}

async function renderLayout(jsxPath: string, connectionId: string) {
    const file = Bun.file(join(import.meta.dir, '../src', 'layout.html'))
    const html = await file.text()
    const context = hasher.generateContext(connectionId)
    const jsxOutput = await renderJSX(jsxPath, context)
    return html
        .replace('%COMPONENT_ENTRY%', jsxOutput)
        .replace('%APP_TITLE%', process.env['APP_TITLE'] as string)
        .replace('%CONNECTION_ID%', connectionId)
}

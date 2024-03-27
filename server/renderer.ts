import { join } from 'path'
import { stateHash, type ComponentContext } from '../lib/state-hash'
import { connectToHub } from '../lib/bun-worker-hub'

const hub = connectToHub({
    renderJSX: (jsxPath, connectionId) => renderLayout(jsxPath, connectionId),
    unsubscribe: async (connectionId) => hasher.unsubscribe(connectionId)
})
const hasher = stateHash((state, id, connections) => {
    return state.onChange((val) => {
        hub.fetch('ws', 'pushState', val, id, [...connections])
    })
})

interface Properties {
    [name: string]: any
}

function renderProps(props: Properties, { connectionId }: ComponentContext) {
    const reactiveProps = []
    let strProps = ''
    for (const prop in props) {
        const value = props[prop]
        if (typeof value === 'function' && 'onChange' in value) {
            reactiveProps.push([prop, hasher.id(value, connectionId)])
            strProps += ` ${prop}="${value()}"`
        } else {
            strProps += ` ${prop}="${value}"`
        }
    }
    if (reactiveProps.length) {
        strProps += ` rektp="${reactiveProps.map((p) => p.join(':')).join(' ')}"`
    }
    return strProps
}

function renderToHTML(items: any, context: ComponentContext) {
    const { connectionId } = context
    let html = ''
    for (const item of items) {
        if (typeof item === 'function' && 'onChange' in item) {
            html += `<rekt s="${hasher.id(item, connectionId)}">${item()}</rekt>`
        } else if (item instanceof Array) {
            const [comp, props, children] = item
            if (typeof comp === 'function') {
                html += renderToHTML(comp(props, children, context), context)
            } else {
                html += `<${comp}${renderProps(props, context)}>${renderToHTML(children, context)}</${comp}>`
            }
        } else {
            html += item.toString()
        }
    }
    return html
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

async function renderJSX(src: string, context: ComponentContext) {
    const component = await import(src)
    const result = component.default({}, [], context)
    return renderToHTML(result, context)
}

console.log('renderer is ready')

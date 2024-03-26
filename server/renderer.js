import { join } from 'path'
import { stateHash } from '../lib/state-hash'
import { connectToHub } from '../lib/bun-worker-hub'

const hub = connectToHub({
    renderJSX: (jsxPath, connectId) => renderLayout(jsxPath, connectId),
    unsubscribe: (connectId) => hasher.unsubscribe(connectId)
})
const hasher = stateHash((state, id, connections) => {
    return state.onChange((val) => {
        hub.fetch('ws', 'pushState', val, id, [...connections])
    })
})

function renderProps(props, connectId) {
    const reactiveProps = []
    let strProps = ''
    for (const prop in props) {
        const value = props[prop]
        if (typeof value === 'function' && 'onChange' in value) {
            reactiveProps.push([prop, hasher.id(value, connectId)])
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

function renderToHTML(items, connectId) {
    let html = ''
    for (const item of items) {
        if (typeof item === 'function' && 'onChange' in item) {
            html += `<rekt s="${hasher.id(item, connectId)}">${item()}</rekt>`
        } else if (item instanceof Array) {
            const [comp, props, children] = item
            if (typeof comp === 'function') {
                html += renderToHTML(comp(props, children), connectId)
            } else {
                html += `<${comp}${renderProps(props, connectId)}>${renderToHTML(children, connectId)}</${comp}>`
            }
        } else {
            html += item.toString()
        }
    }
    return html
}

async function renderLayout(jsxPath, connectId) {
    const file = Bun.file(join(import.meta.dir, '../src', 'layout.html'))
    const html = await file.text()
    const jsxOutput = await renderJSX(jsxPath, connectId)
    return html
        .replace('%entry%', jsxOutput)
        .replace('%title%', process.env.APP_TITLE)
        .replace('%connect_id%', connectId)
}

async function renderJSX(src, connectId) {
    const component = await import(src)
    const result = component.default({}, [], {})
    return renderToHTML(result, connectId)
}

console.log('renderer is ready')

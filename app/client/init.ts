import type { RektComponent } from '../../lib/common/jsx-runtime'
import { createContext } from '../../lib/common/jsx-runtime'
import { renderDom } from '../../lib/client/rekt-dom'
import { destroyListItem, insertListItem, replaceListItem, select, selectAll } from '../../lib/client/utils'
import '../../lib/client/hot-reload'

interface BindData {
    elem: any
    attr?: string
    bind?: string
}

const cid = document.body.getAttribute('rekt-cid')
const wsHost = 'localhost:3100'
const socket = new WebSocket(`ws://${wsHost}/${cid}`)
const stateBindings = new Map<string, BindData[]>()

function setBinding(stateId: string, elem: any, type: 'bind' | 'attr', value: string) {
    if (!stateBindings.has(stateId)) {
        stateBindings.set(stateId, [])
    }
    const bindings = stateBindings.get(stateId)!
    bindings.push({ elem, [type]: value })
}

// Client Side Component Imports
for (const elem of selectAll('rekt[type="client"]')) {
    const src = elem.getAttribute('src') + '.js' || ''
    const globalContext = createContext()
    import(src).then(async (Comp: { default: RektComponent }) => {
        const componentContext = createContext()
        renderDom(elem, await Comp.default({}, componentContext), globalContext)
    })
}

// State Bindings
for (const elem of selectAll('rekt[s]')) {
    const stateId = elem.getAttribute('s')!
    const text = document.createTextNode(elem.textContent || '')
    elem.replaceWith(text)
    setBinding(stateId, text, 'bind', 'textContent')
}
for (const elem of selectAll('[rekt-p]')) {
    const attribs = elem.getAttribute('rekt-p')!
    for (const propPair of attribs.split(' ')) {
        const [prop, stateId] = propPair.split(':')
        setBinding(stateId, elem, 'attr', prop)
    }
    elem.removeAttribute('rekt-p')
}
for (const elem of selectAll('[rekt-b]')) {
    const binds = elem.getAttribute('rekt-b')!
    for (const propPair of binds.split(' ')) {
        const [prop, stateId] = propPair.split(':')
        setBinding(stateId, elem, 'bind', prop)
    }
    elem.removeAttribute('rekt-b')
}

// Trigger Bindings
for (const elem of selectAll('[rekt-t]')) {
    const attribs = elem.getAttribute('rekt-t')!
    for (const propPair of attribs.split(' ')) {
        const [eventName, handlerId] = propPair.split(':')
        elem.addEventListener(eventName, () => fetch(`/trigger?${handlerId}`))
    }
    elem.removeAttribute('rekt-t')
}

// Form Submission Handlers
for (const elem of selectAll('form[rekt-f]')) {
    const formId = elem.getAttribute('rekt-f')
    elem.addEventListener('submit', (ev: SubmitEvent) => {
        const formData: any = new FormData(ev.currentTarget as HTMLFormElement)
        fetch(`/submit?${formId}`, { method: 'post', body: formData })
        ev.preventDefault()
    })
    elem.removeAttribute('rekt-f')
}

socket.addEventListener('message', ({ data }) => {
    const [code] = data.split(':', 1)
    if (code === 'c') {
        const [stateId] = data.slice(2).split(':', 1)
        const value = data.slice(stateId.length + 3)
        const bindings = stateBindings.get(stateId)
        for (const { elem, bind, attr } of bindings || []) {
            if (bind) {
                elem[bind] = value
            } else {
                elem.setAttribute(attr, value)
            }
        }
    } else if (code === 'u') {
        const [itemId] = data.slice(2).split(':', 1)
        const replaceId = data.slice(itemId.length + 3)
        fetch(`/partial?${itemId}`)
            .then((res) => res.text())
            .then((text) => replaceListItem(itemId, replaceId, text))
    } else if (code === 'ib') {
        const [itemId] = data.slice(3).split(':', 1)
        const insertBeforeId = data.slice(itemId.length + 4)
        const target = select(`rekt[ib="${insertBeforeId}"]`)
        fetch(`/partial?${itemId}`)
            .then((res) => res.text())
            .then((text) => insertListItem(itemId, text, target))
    } else if (code === 'ie') {
        const [itemId] = data.slice(3).split(':', 1)
        const insertBeforeId = data.slice(itemId.length + 4)
        const target = select(`rekt[le="${insertBeforeId}"]`)
        fetch(`/partial?${itemId}`)
            .then((res) => res.text())
            .then((text) => insertListItem(itemId, text, target))
    } else if (code === 'd') {
        const deleteId = data.slice(2)
        destroyListItem(deleteId)
    }
})

import type { RektComponent, RektContext } from '../../lib/common/jsx-runtime'
import { removeFromArray } from '@aldinh777/toolbox/array-operation'
import { createContext } from '../../lib/common/jsx-runtime'
import { renderDom, text } from '../../lib/client/rekt-dom'
import { select, selectAll } from '../../lib/client/utils'
import '../../lib/client/hot-reload'

interface BindData {
    elem: any
    attr?: string
    bind?: string
}
interface ElementBorderData {
    begin: Text
    end: Text
}
interface ItemElementData extends ElementBorderData {
    context: RektContext
}
interface ListElementData extends ElementBorderData {
    items: Map<string, ItemElementData>
}

const cid = document.body.getAttribute('rekt-cid')
const wsHost = 'localhost:3100'
const socket = new WebSocket(`ws://${wsHost}/${cid}`)
const stateBindings = new Map<string, BindData[]>()
const listBindings = new Map<string, ListElementData>()

function setBinding(stateId: string, elem: any, type: 'bind' | 'attr', value: string) {
    if (!stateBindings.has(stateId)) {
        stateBindings.set(stateId, [])
    }
    const bindings = stateBindings.get(stateId)!
    const item = { elem, [type]: value }
    bindings.push(item)
    return () => {
        removeFromArray(bindings, item)
        if (!bindings.length) {
            stateBindings.delete(stateId)
        }
    }
}

function bindClientComponent(node: HTMLElement | Document, context: RektContext) {
    for (const elem of selectAll('rekt[type="client"]', node)) {
        const src = elem.getAttribute('src') + '.js' || ''
        import(src).then(async (Comp: { default: RektComponent }) => {
            const componentContext = createContext()
            renderDom(elem, await Comp.default({}, componentContext), context)
            context.onDismount(() => componentContext.dismount())
        })
    }
}

function bindState(node: HTMLElement | Document, context: RektContext) {
    for (const elem of selectAll('rekt[s]', node)) {
        const stateId = elem.getAttribute('s')!
        const text = document.createTextNode(elem.textContent || '')
        elem.replaceWith(text)
        context.onMount(() => setBinding(stateId, text, 'bind', 'data'))
    }
    for (const elem of selectAll('[rekt-p]', node)) {
        const attribs = elem.getAttribute('rekt-p')!
        for (const propPair of attribs.split(' ')) {
            const [prop, stateId] = propPair.split(':')
            context.onMount(() => setBinding(stateId, elem, 'attr', prop))
        }
        elem.removeAttribute('rekt-p')
    }
    for (const elem of selectAll('[rekt-b]', node)) {
        const binds = elem.getAttribute('rekt-b')!
        for (const propPair of binds.split(' ')) {
            const [prop, stateId] = propPair.split(':')
            context.onMount(() => setBinding(stateId, elem, 'bind', prop))
        }
        elem.removeAttribute('rekt-b')
    }
}

function bindTrigger(node: HTMLElement | Document) {
    for (const elem of selectAll('[rekt-t]', node)) {
        const attribs = elem.getAttribute('rekt-t')!
        for (const propPair of attribs.split(' ')) {
            const [eventName, handlerId] = propPair.split(':')
            elem.addEventListener(eventName, () => fetch(`/trigger?${handlerId}`, { method: 'post' }))
        }
        elem.removeAttribute('rekt-t')
    }
}

function bindForm(node: HTMLElement | Document) {
    for (const elem of selectAll('form[rekt-f]', node)) {
        const formId = elem.getAttribute('rekt-f')
        elem.addEventListener('submit', (ev: SubmitEvent) => {
            const form = ev.currentTarget as HTMLFormElement
            const formData: any = new FormData(form)
            fetch(`/submit?${formId}`, { method: 'post', body: formData })
            const afterSubmit = form.getAttribute('afterSubmit')
            for (const input of selectAll('[name]', form) as unknown as HTMLInputElement[]) {
                if (afterSubmit === 'reset' || input.getAttribute('afterSubmit') === 'reset') {
                    input.value = input.getAttribute('resetValue') || ''
                }
            }
            ev.preventDefault()
        })
        elem.removeAttribute('rekt-f')
    }
}

function bindRecursive(node: HTMLElement | Document, context: RektContext) {
    let listElement
    while ((listElement = select('rekt[l]', node))) {
        const listId = listElement.getAttribute('l')!
        const listBegin = text()
        const listEnd = text()
        const listItems = new Map<string, ItemElementData>()
        listBindings.set(listId, { begin: listBegin, end: listEnd, items: listItems })
        const contents: any[] = [listBegin]
        for (const item of listElement.children as unknown as HTMLElement[]) {
            const itemId = item.getAttribute('i')!
            const context = createContext()
            const itemBegin = text()
            const itemEnd = text()
            listItems.set(itemId, { begin: itemBegin, end: itemEnd, context })
            contents.push(itemBegin)
            bindRecursive(item, context)
            contents.push(...(item.childNodes as any), itemEnd)
        }
        contents.push(listEnd)
        for (const content of contents) {
            listElement.parentNode?.insertBefore(content, listElement)
        }
        listElement.remove()
    }
    bindClientComponent(node, context)
    bindState(node, context)
    bindTrigger(node)
    bindForm(node)
}

bindRecursive(document, createContext())

console.log(listBindings)

globalThis.listBindings = listBindings

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
        const [listId, itemId, replaceId] = data.slice(2).split(':')
        console.log({ listId, itemId, replaceId })
        // fetch(`/partial?${itemId}`)
        //     .then((res) => res.text())
        //     .then((text) => replaceListItem(itemId, replaceId, text))
    } else if (code === 'i') {
        const [listId, itemId, nextItemId] = data.slice(2).split(':')
        console.log({ listId, itemId, nextItemId })
        // fetch(`/partial?${itemId}`)
        //     .then((res) => res.text())
        //     .then((text) => insertListItem(nextItemId, text))
    } else if (code === 'l') {
        const [listId, itemId] = data.slice(2).split(':')
        console.log({ listId, itemId })
        // fetch(`/partial?${itemId}`)
        //     .then((res) => res.text())
        //     .then((text) => insertListItemLast(listItemId, text))
    } else if (code === 'd') {
        const [listId, itemId] = data.slice(2).split(':')
        console.log({ listId, itemId })
        // destroyListItem(deleteId)
    }
})

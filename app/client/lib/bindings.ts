import type { RektComponent, RektContext } from '@aldinh777/rekt-jsx/jsx-runtime'
import { removeFromArray } from '@aldinh777/toolbox/array-operation'
import { createContext } from '@aldinh777/rekt-jsx/jsx-runtime'
import { destroyElements, renderDom, select, selectAll, text } from './rekt-dom'

interface BindData {
    elem: any
    attr?: string
    bind?: string
}
interface ElementBorderData {
    context: RektContext
    begin: Text
    end: Text
}
interface ListElementData extends ElementBorderData {
    items: Map<string, ElementBorderData>
}

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
            elem.innerHTML = ''
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
            elem.addEventListener(eventName, () => {
                if ('value' in elem) {
                    fetch(`/trigger?${handlerId}`, { method: 'post', body: String(elem.value) })
                } else {
                    fetch(`/trigger?${handlerId}`, { method: 'post' })
                }
            })
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

export function bindRecursive(node: HTMLElement | Document, context: RektContext) {
    let listElement
    while ((listElement = select('rekt[l]', node))) {
        const listId = listElement.getAttribute('l')!
        const listBegin = text()
        const listEnd = text()
        const listItems = new Map<string, ElementBorderData>()
        listBindings.set(listId, { begin: listBegin, end: listEnd, items: listItems, context })
        const contents: any[] = [listBegin]
        for (const item of listElement.children as unknown as HTMLElement[]) {
            const itemId = item.getAttribute('i')!
            const itemContext = createContext()
            const itemBegin = text()
            const itemEnd = text()
            listItems.set(itemId, { begin: itemBegin, end: itemEnd, context: itemContext })
            context.onDismount(() => itemContext.dismount())
            contents.push(itemBegin)
            bindRecursive(item, itemContext)
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

export function updateState(stateId: string, value: string) {
    const bindings = stateBindings.get(stateId)
    for (const { elem, bind, attr } of bindings || []) {
        if (bind) {
            elem[bind] = value
        } else {
            elem.setAttribute(attr, value)
        }
    }
}

export function destroyListItem(listId: string, itemId: string) {
    const list = listBindings.get(listId)!
    const item = list.items.get(itemId)!
    destroyElements(item.begin, item.end)
    item.context.dismount()
    list.items.delete(itemId)
}

export function insertListItem(html: string, listId: string, itemId: string, nextId?: string) {
    const list = listBindings.get(listId)!
    const targetBefore = nextId ? list.items.get(nextId)!.begin : list.end
    const holder = document.createElement('div')
    holder.innerHTML = html
    const itemBegin = text()
    const itemEnd = text()
    const itemContext = createContext()
    list.items.set(itemId, { begin: itemBegin, end: itemEnd, context: itemContext })
    list.context.onDismount(() => itemContext.dismount())
    bindRecursive(holder, itemContext)
    targetBefore.parentNode?.insertBefore(itemBegin, targetBefore)
    while (holder.firstChild) {
        targetBefore.parentNode?.insertBefore(holder.firstChild, targetBefore)
    }
    targetBefore.parentNode?.insertBefore(itemEnd, targetBefore)
}

export function replaceListItem(html: string, listId: string, itemId: string, replaceId: string) {
    insertListItem(html, listId, itemId, replaceId)
    destroyListItem(listId, replaceId)
}

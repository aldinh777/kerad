import type { RektComponent } from '../common/jsx-runtime'
import { generateContext, renderDom } from './rekt-dom'
import { destroyListItem, insertListItem, replaceListItem, select, selectAll } from './utils'
import './hot-reload'

const cid = document.body.getAttribute('rekt-cid')
const socket = new WebSocket(`ws://localhost:3100/${cid}`)

socket.addEventListener('message', ({ data }) => {
    const [code] = data.split(':', 1)
    if (code === 'c') {
        const [stateId] = data.slice(2).split(':', 1)
        const value = data.slice(stateId.length + 3)
        const dynamicValues = selectAll('rekt[s]')
        const dynamicProps = selectAll('[rekt-p]')
        for (const elem of dynamicValues) {
            if (elem.getAttribute('s') === stateId) {
                elem.textContent = value
            }
        }
        for (const elem of dynamicProps) {
            const attribs = elem.getAttribute('rekt-p')!
            for (const propPair of attribs.split(' ')) {
                const [prop, targetId] = propPair.split(':')
                if (targetId === stateId) {
                    elem.setAttribute(prop, value)
                }
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

for (const elem of selectAll('[rekt-t]')) {
    const attribs = elem.getAttribute('rekt-t')!
    for (const propPair of attribs.split(' ')) {
        const [eventName, handlerId] = propPair.split(':')
        elem.addEventListener(eventName, () => fetch(`/trigger?${handlerId}`))
    }
}

for (const elem of selectAll('rekt[type="client"]')) {
    const src = elem.getAttribute('src') + '.js' || ''
    const globalContext = generateContext()
    import(src).then(async (Comp: {default: RektComponent}) => {
        const componentContext = generateContext()
        renderDom(elem, await Comp.default({}, componentContext), globalContext)
    })
}

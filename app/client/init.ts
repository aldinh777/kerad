import { createContext } from '@aldinh777/rekt-jsx/jsx-runtime'
import { bindRecursive, destroyListItem, insertListItem, replaceListItem, updateState } from './lib/bindings'
import './lib/hot-reload'

const cid = document.body.getAttribute('rekt-cid')!
const wsHost = 'localhost:3100'
const socket = new WebSocket(`ws://${wsHost}/connect?${cid}`)

bindRecursive(document, createContext())

socket.addEventListener('message', ({ data }) => {
    const [code] = data.split(':', 1)
    if (code === 'c') {
        const [stateId] = data.slice(2).split(':', 1)
        const value = data.slice(stateId.length + 3)
        updateState(stateId, value)
    } else if (code === 'u') {
        const [listId, itemId, replaceId] = data.slice(2).split(':')
        fetch(`/partial?${listId}-${itemId}`, { headers: { 'Connection-ID': cid } })
            .then((res) => res.text())
            .then((htmlText) => replaceListItem(htmlText, listId, itemId, replaceId))
    } else if (code === 'i') {
        const [listId, itemId, nextItemId] = data.slice(2).split(':')
        fetch(`/partial?${listId}-${itemId}`, { headers: { 'Connection-ID': cid } })
            .then((res) => res.text())
            .then((htmlText) => insertListItem(htmlText, listId, itemId, nextItemId))
    } else if (code === 'l') {
        const [listId, itemId] = data.slice(2).split(':')
        fetch(`/partial?${listId}-${itemId}`, { headers: { 'Connection-ID': cid } })
            .then((res) => res.text())
            .then((htmlText) => insertListItem(htmlText, listId, itemId))
    } else if (code === 'd') {
        const [listId, itemId] = data.slice(2).split(':')
        destroyListItem(listId, itemId)
    }
})

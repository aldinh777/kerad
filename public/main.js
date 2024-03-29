const cid = document.body.getAttribute('rekt-cid')
const socket = new WebSocket(`ws://localhost:3100/${cid}`)

socket.addEventListener('message', ({ data }) => {
    const [code] = data.split(':', 1)
    if (code === 'c') {
        const [stateId] = data.slice(2).split(':', 1)
        const value = data.slice(stateId.length + 3)
        const dynamicValues = document.querySelectorAll('rekt[s]')
        const dynamicProps = document.querySelectorAll('[rekt-p]')
        for (const elem of dynamicValues) {
            if (elem.getAttribute('s') === stateId) {
                elem.textContent = value
            }
        }
        for (const elem of dynamicProps) {
            const attribs = elem.getAttribute('rekt-p')
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
        console.log({ nextId: itemId, insertBeforeId })
        const target = document.querySelector(`rekt[ib="${insertBeforeId}"]`)
        fetch(`/partial?${itemId}`)
            .then((res) => res.text())
            .then((text) => insertListItem(itemId, text, target))
    } else if (code === 'ie') {
        const [itemId] = data.slice(3).split(':', 1)
        const insertBeforeId = data.slice(itemId.length + 4)
        const target = document.querySelector(`rekt[le="${insertBeforeId}"]`)
        fetch(`/partial?${itemId}`)
            .then((res) => res.text())
            .then((text) => insertListItem(itemId, text, target))
    } else if (code === 'd') {
        const deleteId = data.slice(2)
        destroyListItem(deleteId)
    }
})

const triggerElements = document.querySelectorAll('[rekt-t]')
for (const elem of triggerElements) {
    const attribs = elem.getAttribute('rekt-t')
    for (const propPair of attribs.split(' ')) {
        const [eventName, handlerId] = propPair.split(':')
        elem.addEventListener(eventName, () => fetch(`/trigger?${handlerId}`))
    }
}

function destroyListItem(deleteId) {
    let current = document.querySelector(`rekt[ib="${deleteId}"]`)
    const end = document.querySelector(`rekt[ie="${deleteId}"]`)
    while (current !== end) {
        const prev = current
        current = current.nextSibling
        prev.remove()
    }
    current?.remove()
}

function insertListItem(itemId, html, targetBefore) {
    const htmlContent = `<rekt ib=${itemId}></rekt>${html}<rekt ie=${itemId}></rekt>`
    const holder = document.createElement('div')
    holder.innerHTML = htmlContent
    while (holder.firstChild) {
        targetBefore.parentNode.insertBefore(holder.firstChild, targetBefore)
    }
}

function replaceListItem(itemId, replaceId, html) {
    const target = document.querySelector(`rekt[ib="${replaceId}"]`)
    insertListItem(itemId, html, target)
    destroyListItem(replaceId)
}

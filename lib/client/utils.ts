export const select = (query: string, node: HTMLElement | Document = document) => node.querySelector(query)
export const selectAll = (query: string, node: HTMLElement | Document = document) =>
    node.querySelectorAll(query) as unknown as HTMLElement[]

export function destroyElements(startMarker: any, endMarker: any) {
    while (startMarker !== endMarker) {
        const node = startMarker
        startMarker = startMarker.nextSibling!
        node.remove()
    }
    endMarker?.remove()
}

export function destroyListItem(deleteId: string) {
    const start = select(`rekt[ib="${deleteId}"]`)
    const end = select(`rekt[ie="${deleteId}"]`)
    destroyElements(start, end)
}

export function insertListItem(itemId: string, html: string, targetBefore: any) {
    const htmlContent = `<rekt ib=${itemId}></rekt>${html}<rekt ie=${itemId}></rekt>`
    const holder = document.createElement('div')
    holder.innerHTML = htmlContent
    while (holder.firstChild) {
        targetBefore?.parentNode?.insertBefore(holder.firstChild, targetBefore)
    }
}

export function replaceListItem(itemId: string, replaceId: string, html: string) {
    const target = select(`rekt[ib="${replaceId}"]`)
    insertListItem(itemId, html, target)
    destroyListItem(replaceId)
}

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

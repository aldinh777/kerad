export interface RektContext {
    connectionId: string
    onMount(mountHandler: () => () => void | void): void
}

export interface RektProps {
    [prop: string]: any
    children: any[]
}

interface RektElement {
    tag: string | Component
    props: RektProps
}

type Component = (props: RektProps, context: RektContext) => RektElement

export function jsx(tag: string | Component, props: any): RektElement {
    return { tag, props }
}

export interface ComponentContext {
    connectionId: string
    onMount(mountHandler: () => () => void | void): void
}

interface ComponentProperties {
    [prop: string]: any
    children: any[]
}

interface RektElement {
    tag: string | Component
    props: ComponentProperties
}

type Component = (props: ComponentProperties, context: ComponentContext) => RektElement

export function jsx(tag: string | Component, props: any): RektElement {
    return { tag, props }
}

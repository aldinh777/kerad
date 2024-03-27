import type { State } from '@aldinh777/reactive'

export interface RektContext {
    connectionId: string
    onMount(mountHandler: () => () => void | void): void
}

export interface RektProps {
    [prop: string]: any
    children?: RektNode | RektNode[]
}

interface RektElement {
    tag: string | RektComponent
    props: RektProps
}

export type RektNode = string | State | RektElement
type RektComponent = (props: RektProps, context: RektContext) => RektNode | RektNode[]

export function jsx(tag: string | RektComponent, props: any): RektElement {
    return { tag, props }
}

export const Fragment: RektComponent = (props) => props.children || []

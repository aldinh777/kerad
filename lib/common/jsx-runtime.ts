import type { State } from '@aldinh777/reactive'
import type { WatchableList } from '@aldinh777/reactive/collection/list'
import type { Unsubscribe } from '@aldinh777/reactive/utils/subscription'

export interface RektContext {
    onMount(mountHandler: () => Unsubscribe | void): void
    onDismount(dismountHandler: Unsubscribe): void
    dismount(): void
    setTimeout(ms: number, handler: () => any): any
    setInterval(ms: number, handler: () => any): any
}

export interface ServerContext extends RektContext {
    id: string
    connectionId: string
}

export interface RektProps {
    [prop: string]: any
    children?: RektNode | RektNode[]
}

interface RektElement {
    tag: string | RektComponent
    props: RektProps
}

export type RektNode = string | State | WatchableList<any> | RektElement
export type RektComponent = (
    props: RektProps,
    context: RektContext
) => Promise<RektNode | RektNode[]> | RektNode | RektNode[]

export function jsx(tag: string | RektComponent, props: any): RektElement {
    return { tag, props }
}

export const Fragment: RektComponent = (props) => props.children || []

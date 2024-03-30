import type { State } from '@aldinh777/reactive'
import type { WatchableList } from '@aldinh777/reactive/collection/list'
import type { Unsubscribe } from '@aldinh777/reactive/utils/subscription'

export interface RektContext {
    id: string
    connectionId: string
    onMount(mountHandler: () => Unsubscribe | void): void
    onDismount(dismountHandler: Unsubscribe): void
    dismount(): void
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
type RektComponent = (props: RektProps, context: RektContext) => Promise<RektNode | RektNode[]> | RektNode | RektNode[]

export function jsx(tag: string | RektComponent, props: any): RektElement {
    return { tag, props }
}

export const Fragment: RektComponent = (props) => props.children || []

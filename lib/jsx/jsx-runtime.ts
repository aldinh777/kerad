import type { Context } from '@aldinh777/kerad-core';
import type { State } from '@aldinh777/reactive';
import type { WatchableList } from '@aldinh777/reactive/watchable';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            // @ts-ignore
            [elemName: string]: any;
        }
    }
}

export interface Props extends Record<string, any> {
    children?: Node | Node[];
}

interface Element {
    tag: string | Component;
    props: Props;
}

export type Node = string | State | WatchableList<any> | Element;
export type Component = (props: Props, context: Context) => Promise<Node | Node[]> | Node | Node[];

export function jsx(tag: string | Component, props: any): Element {
    return { tag, props };
}

export const Fragment: Component = (props) => props.children || [];

import type { Props, Node } from '@aldinh777/kerad-jsx';
import { Context } from '@aldinh777/kerad-core/context.ts';

interface StoredItem {
    itemStart: Text;
    itemEnd: Text;
    item: Node | Node[];
    context: Context;
}

export const text = (str: string = '') => document.createTextNode(str);
export const elem = (tag: string, props: Props, context: Context) => {
    const el = document.createElement(tag);
    renderProps(el, props, context);
    return el;
};

export const select = (query: string, node: HTMLElement | Document = document) => node.querySelector(query);
export const selectAll = (query: string, node: HTMLElement | Document = document) =>
    node.querySelectorAll(query) as unknown as HTMLElement[];

export function destroyElements(startMarker: any, endMarker: any) {
    while (startMarker !== endMarker) {
        const node = startMarker;
        startMarker = startMarker.nextSibling!;
        node.remove();
    }
    endMarker?.remove();
}

export function setProperty(elem: HTMLElement, prop: string, value: any) {
    if (prop in elem) {
        (elem as any)[prop] = value;
    } else {
        elem.setAttribute(prop, value);
    }
}

function renderProps(elem: HTMLElement, props: Props, context: Context) {
    for (const prop in props) {
        const value = props[prop];
        if (prop === 'children') {
            continue;
        } else if (prop.startsWith('on:')) {
            const eventName = prop.slice(3);
            elem.addEventListener(eventName, value);
        } else if (typeof value === 'function' && 'onChange' in value) {
            setProperty(elem, prop, value());
            context.onMount(() => value.onChange((value: any) => elem.setAttribute(prop, value), true));
        } else {
            setProperty(elem, prop, value);
        }
    }
}

function insertIfBefore(target: HTMLElement, item: Text | HTMLElement, before?: Text) {
    if (before) {
        target.insertBefore(item, before);
    } else {
        target.append(item);
    }
}

export async function renderDom(target: HTMLElement, item: Node | Node[], context: Context, before?: Text) {
    if (item instanceof Array) {
        for (const nested of item) {
            await renderDom(target, nested, context, before);
        }
    } else if (typeof item === 'string') {
        insertIfBefore(target, text(item), before);
    } else if (typeof item === 'function') {
        if ('onChange' in item) {
            const textNode = text(item());
            insertIfBefore(target, textNode, before);
            context.onMount(() => item.onChange((value) => (textNode.textContent = value), true));
        } else if ('onUpdate' in item && 'onInsert' in item && 'onDelete' in item) {
            const listStart = text();
            const listEnd = text();
            const mappedList = item.map<StoredItem>((listItem) => ({
                itemStart: text(),
                itemEnd: text(),
                item: listItem,
                context: new Context()
            }));
            insertIfBefore(target, listStart, before);
            for (const { item: listItem, context: itemContext, itemStart, itemEnd } of mappedList()) {
                insertIfBefore(target, itemStart, before);
                await renderDom(target, listItem, itemContext, before);
                insertIfBefore(target, itemEnd, before);
            }
            insertIfBefore(target, listEnd, before);
            context.onMount(() => {
                const unsubWatch = mappedList.watch({
                    async update(_index, current, prev) {
                        target.insertBefore(current.itemStart, prev.itemStart);
                        await renderDom(target, current.item, context, prev.itemStart);
                        target.insertBefore(current.itemEnd, prev.itemStart);
                        destroyElements(prev.itemStart, prev.itemEnd);
                    },
                    async insert(index, { item: listItem, context, itemStart, itemEnd }) {
                        const isLast = index >= mappedList().length - 1;
                        const marker = isLast ? listEnd : itemStart;
                        target.insertBefore(itemStart, marker);
                        await renderDom(target, listItem, context, marker);
                        target.insertBefore(itemEnd, marker);
                    },
                    delete(_index, { context, itemStart, itemEnd }) {
                        destroyElements(itemStart, itemEnd);
                        context.dismount();
                    }
                });
                return () => {
                    unsubWatch();
                    for (const { context } of mappedList()) {
                        context.dismount();
                    }
                };
            });
        }
    } else if (typeof item === 'object' && 'tag' in item && 'props' in item) {
        const { tag, props } = item;
        if (typeof tag === 'string') {
            const parent = elem(tag, props, context);
            if (props.children !== undefined) {
                await renderDom(parent, props.children, context);
            }
            insertIfBefore(target, parent, before);
        } else {
            await renderDom(target, await tag(props, context), context, before);
        }
    } else {
        await renderDom(target, String(item), context, before);
    }
}

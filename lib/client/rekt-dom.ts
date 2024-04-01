import type { RektProps, RektContext, RektNode } from '../common/jsx-runtime'
import type { Unsubscribe } from '@aldinh777/reactive/utils/subscription'
import type { ObservedList } from '@aldinh777/reactive/collection/list'
import { maplist } from '@aldinh777/reactive/collection/list/map'
import { destroyElements } from './utils'

interface StoredItem {
    itemStart: Text
    itemEnd: Text
    item: RektNode | RektNode[]
    context: RektContext
}

const text = (str: string) => document.createTextNode(str)
const elem = (tag: string, props: RektProps, context: RektContext) => {
    const el = document.createElement(tag)
    renderProps(el, props, context)
    return el
}

function renderProps(elem: HTMLElement, props: RektProps, context: RektContext) {
    for (const prop in props) {
        const value = props[prop]
        if (prop === 'children') {
            continue
        } else if (prop.startsWith('on:')) {
            const eventName = prop.slice(3)
            elem.addEventListener(eventName, value)
        } else if (typeof value === 'function' && 'onChange' in value) {
            elem.setAttribute(prop, value())
            context.onMount(() => value.onChange((value: any) => elem.setAttribute(prop, value)))
        } else {
            elem.setAttribute(prop, value)
        }
    }
}

export async function renderDom(target: HTMLElement, item: RektNode | RektNode[], context: RektContext, before?: Text) {
    if (item instanceof Array) {
        for (const nested of item) {
            await renderDom(target, nested, context, before)
        }
    } else if (typeof item === 'string') {
        target.append(item)
    } else if (typeof item === 'function') {
        if ('onChange' in item) {
            const textNode = text(item())
            context.onMount(() => item.onChange((value) => (textNode.textContent = value)))
        } else if ('onUpdate' in item && 'onInsert' in item && 'onDelete' in item) {
            const listStart = text('')
            const listEnd = text('')
            const mappedList: ObservedList<StoredItem> = maplist(item, () => ({
                itemStart: text(''),
                itemEnd: text(''),
                item: item,
                context: generateContext()
            }))
            target.append(listStart)
            for (const { item: listItem, context: itemContext, itemStart, itemEnd } of mappedList()) {
                target.append(itemStart)
                await renderDom(target, listItem, itemContext)
                target.append(itemEnd)
            }
            target.append(listEnd)
            context.onMount(() => {
                const unsubWatch = mappedList.watch({
                    async update(_index, current, prev) {
                        target.append(current.itemStart)
                        await renderDom(target, current.item, context, prev.itemStart)
                        target.append(current.itemEnd)
                        destroyElements(prev.itemStart, prev.itemEnd)
                    },
                    async insert(index, { item: listItem, context, itemStart, itemEnd }) {
                        const isLast = index >= mappedList().length - 1
                        const marker = isLast ? listEnd : itemStart
                        target.append(itemStart)
                        await renderDom(target, listItem, context, marker)
                        target.append(itemEnd)
                    },
                    delete(_index, { context, itemStart, itemEnd }) {
                        destroyElements(itemStart, itemEnd)
                        context.dismount()
                    }
                })
                return () => {
                    unsubWatch()
                    mappedList.stop()
                    for (const { context } of mappedList()) {
                        context.dismount()
                    }
                }
            })
        }
    } else if (typeof item === 'object' && 'tag' in item && 'props' in item) {
        const { tag, props } = item
        if (typeof tag === 'string') {
            const parent = elem(tag, props, context)
            if (props.children !== undefined) {
                await renderDom(parent, props.children, context)
            }
            target.append(parent)
        } else {
            await renderDom(target, await tag(props, context), context)
        }
    } else {
        await renderDom(target, String(item), context, before)
    }
}

export function generateContext(): RektContext {
    const unsubscribers: Unsubscribe[] = []
    return {
        onMount(mountHandler) {
            const dismountHandler = mountHandler()
            if (dismountHandler) {
                this.onDismount(dismountHandler)
            }
        },
        onDismount(dismountHandler) {
            unsubscribers.push(dismountHandler)
        },
        dismount() {
            for (const unsubscribe of unsubscribers) {
                unsubscribe()
            }
        },
        setInterval(ms, handler) {
            this.onMount(() => {
                const interval = setInterval(() => {
                    try {
                        handler()
                    } catch (error) {
                        console.error(error)
                    }
                }, ms)
                return () => clearInterval(interval)
            })
        },
        setTimeout(ms, handler) {
            this.onMount(() => {
                const timeout = setTimeout(() => {
                    try {
                        handler()
                    } catch (error) {
                        console.error(error)
                    }
                }, ms)
                return () => clearTimeout(timeout)
            })
        }
    }
}

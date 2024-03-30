import type { State } from '@aldinh777/reactive'
import type { Unsubscribe } from '@aldinh777/reactive/utils/subscription'
import type { RektContext, RektNode } from '../lib/jsx-runtime'
import type { ObservedList, WatchableList } from '@aldinh777/reactive/collection/list'
import { randomString } from '@aldinh777/toolbox/random'
import { maplist } from '@aldinh777/reactive/collection/list/map'

interface UniqueHandlers {
    state: (state: State, stateId: string, connectionSet: Set<string>) => Unsubscribe
    list: (mappedList: ObservedList<StoredItem>, listId: string, connectionSet: Set<string>) => Unsubscribe
}
interface ContextSubscription {
    stateSet: Set<State>
    listSet: Set<WatchableList<any>>
    handlerSet: Set<() => any>
    unsubscribers: Unsubscribe[]
}
interface SubscriptionData {
    id: string
    connectionSet: Set<string>
    unsubscribe?: Unsubscribe
}
interface StoredItem {
    item: RektNode | RektNode[]
    context: RektContext
}
export interface TriggerResult {
    status: 'success' | 'not found' | 'error'
    data?: any
    error?: any
}

export function createHasher(uniqueHandlers: UniqueHandlers) {
    const subscriptionMap = new Map<string, ContextSubscription>()
    const stateMap = new Map<State, SubscriptionData>()
    const listMap = new Map<WatchableList<any>, SubscriptionData>()
    const handlerMap = new Map<() => any, SubscriptionData>()
    const triggerMap = new Map<string, () => any>()
    const mappedListMap = new Map<WatchableList<any>, WatchableList<StoredItem>>()
    return {
        generateContext(): RektContext {
            const contextId = randomString(6)
            const unsubscribers: Unsubscribe[] = []
            subscriptionMap.set(contextId, {
                stateSet: new Set(),
                listSet: new Set(),
                handlerSet: new Set(),
                unsubscribers: unsubscribers
            })
            return {
                id: contextId,
                onMount(mountHandler) {
                    const onDismount = mountHandler()
                    if (onDismount) {
                        unsubscribers.push(onDismount)
                    }
                },
                dismount: () => this.unsubscribe(contextId)
            }
        },
        registerState(state: State, { id: contextId }: RektContext) {
            if (subscriptionMap.has(contextId)) {
                const { stateSet } = subscriptionMap.get(contextId)!
                stateSet.add(state)
            }
            if (stateMap.has(state)) {
                const { id: stateId, connectionSet } = stateMap.get(state)!
                connectionSet.add(contextId)
                return stateId
            }
            const stateId = randomString(6)
            const contextSet = new Set([contextId])
            stateMap.set(state, {
                id: stateId,
                connectionSet: contextSet,
                unsubscribe: uniqueHandlers.state(state, stateId, contextSet)
            })
            return stateId
        },
        registerList(list: WatchableList<any>, context: RektContext) {
            const { id: contextId } = context
            if (subscriptionMap.has(contextId)) {
                const { listSet } = subscriptionMap.get(contextId)!
                listSet.add(list)
            }
            if (listMap.has(list)) {
                const { id: listId, connectionSet } = listMap.get(list)!
                connectionSet.add(contextId)
                return listId
            }
            const listId = randomString(6)
            const connectionSet = new Set([contextId])
            const mappedList = maplist(list, (item) => {
                return { item: item, context: this.generateContext() }
            })
            const unsubscribe = uniqueHandlers.list(mappedList, listId, connectionSet)
            listMap.set(list, { id: listId, connectionSet: connectionSet, unsubscribe: unsubscribe })
            mappedListMap.set(list, mappedList)
            return listId
        },
        registerHandler(handler: () => any, context: RektContext) {
            const { id: contextId } = context
            if (typeof handler !== 'function') {
                handler = () => handler
            }
            if (subscriptionMap.has(contextId)) {
                const { handlerSet } = subscriptionMap.get(contextId)!
                handlerSet.add(handler)
            }
            if (handlerMap.has(handler)) {
                const { id: handlerId, connectionSet } = handlerMap.get(handler)!
                connectionSet.add(contextId)
                return handlerId
            }
            const handlerId = randomString(6)
            handlerMap.set(handler, { id: handlerId, connectionSet: new Set([contextId]) })
            triggerMap.set(handlerId, handler)
            return handlerId
        },
        unsubscribe(contextId: string) {
            if (subscriptionMap.has(contextId)) {
                const { stateSet, listSet, handlerSet, unsubscribers } = subscriptionMap.get(contextId)!
                for (const state of [...stateSet]) {
                    const { connectionSet, unsubscribe } = stateMap.get(state)!
                    connectionSet.delete(contextId)
                    if (connectionSet.size === 0) {
                        stateMap.delete(state)
                        unsubscribe!()
                    }
                }
                for (const list of [...listSet]) {
                    const { connectionSet, unsubscribe } = listMap.get(list)!
                    connectionSet.delete(contextId)
                    if (connectionSet.size === 0) {
                        listMap.delete(list)
                        mappedListMap.delete(list)
                        unsubscribe!()
                    }
                }
                for (const handler of [...handlerSet]) {
                    const { id: handlerId, connectionSet } = handlerMap.get(handler)!
                    connectionSet.delete(contextId)
                    if (connectionSet.size === 0) {
                        handlerMap.delete(handler)
                        triggerMap.delete(handlerId)
                    }
                }
                for (const unsubscribe of unsubscribers) {
                    unsubscribe()
                }
                stateSet.clear()
                listSet.clear()
                handlerSet.clear()
                subscriptionMap.delete(contextId)
            }
        },
        getContext(list: WatchableList<any>, index: number) {
            return mappedListMap.get(list)!(index).context
        },
        triggerHandler(handlerId: string): TriggerResult {
            if (triggerMap.has(handlerId)) {
                const handler = triggerMap.get(handlerId)
                try {
                    const data = handler!()
                    return { status: 'success', data: JSON.stringify(data) }
                } catch (error) {
                    return { status: 'error', error: error }
                }
            } else {
                return { status: 'not found' }
            }
        }
    }
}

export async function md5Hash(filename: string) {
    const hasher = new Bun.CryptoHasher('md5')
    const file = Bun.file(filename)
    hasher.update(await file.arrayBuffer())
    return hasher.digest('hex')
}

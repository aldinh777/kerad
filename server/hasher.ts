import type { State } from '@aldinh777/reactive'
import type { Unsubscribe } from '@aldinh777/reactive/utils/subscription'
import type { RektContext, RektNode } from '../lib/jsx-runtime'
import type { ObservedList, WatchableList } from '@aldinh777/reactive/collection/list'
import { randomString } from '@aldinh777/toolbox/random'
import { maplist } from '@aldinh777/reactive/collection/list/map'

interface UniqueHandlers {
    state: (state: State, stateId: string, connectionSet: Set<string>) => Unsubscribe
    list: (
        mappedList: ObservedList<StoredItem>,
        listId: string,
        connectionSet: Set<string>,
        context: RektContext
    ) => Unsubscribe
}
interface ConnectionSubscription {
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
    id: string
    item: RektNode | RektNode[]
}
export interface TriggerResult {
    status: 'success' | 'not found' | 'error'
    data?: any
    error?: any
}

export function createHasher(uniqueHandlers: UniqueHandlers) {
    const subscriptionMap = new Map<string, ConnectionSubscription>()
    const stateMap = new Map<State, SubscriptionData>()
    const listMap = new Map<WatchableList<any>, SubscriptionData>()
    const handlerMap = new Map<() => any, SubscriptionData>()
    const triggerMap = new Map<string, () => any>()
    const mappedListMap = new Map<WatchableList<any>, WatchableList<StoredItem>>()
    return {
        generateContext(newConnectionId: string): RektContext {
            const unsubscribers: Unsubscribe[] = []
            subscriptionMap.set(newConnectionId, {
                stateSet: new Set(),
                listSet: new Set(),
                handlerSet: new Set(),
                unsubscribers: unsubscribers
            })
            return {
                connectionId: newConnectionId,
                onMount(mountHandler) {
                    const onDismount = mountHandler()
                    if (onDismount) {
                        unsubscribers.push(onDismount)
                    }
                }
            }
        },
        registerState(state: State, { connectionId }: RektContext) {
            if (subscriptionMap.has(connectionId)) {
                const { stateSet } = subscriptionMap.get(connectionId)!
                stateSet.add(state)
            }
            if (stateMap.has(state)) {
                const { id: stateId, connectionSet } = stateMap.get(state)!
                connectionSet.add(connectionId)
                return stateId
            }
            const stateId = randomString(6)
            const connectionSet = new Set([connectionId])
            stateMap.set(state, {
                id: stateId,
                connectionSet: connectionSet,
                unsubscribe: uniqueHandlers.state(state, stateId, connectionSet)
            })
            return stateId
        },
        registerList(list: WatchableList<any>, context: RektContext) {
            const { connectionId } = context
            if (subscriptionMap.has(connectionId)) {
                const { listSet } = subscriptionMap.get(connectionId)!
                listSet.add(list)
            }
            if (listMap.has(list)) {
                const { id: listId, connectionSet } = listMap.get(list)!
                connectionSet.add(connectionId)
                return listId
            }
            const listId = randomString(6)
            const connectionSet = new Set([connectionId])
            const mappedList = maplist(list, (item) => {
                return { item: item, id: randomString(6) }
            })
            const unsubscribe = uniqueHandlers.list(mappedList, listId, connectionSet, context)
            listMap.set(list, { id: listId, connectionSet: connectionSet, unsubscribe: unsubscribe })
            mappedListMap.set(list, mappedList)
            return listId
        },
        registerHandler(handler: () => any, { connectionId }: RektContext) {
            if (typeof handler !== 'function') {
                handler = () => handler
            }
            if (subscriptionMap.has(connectionId)) {
                const { handlerSet } = subscriptionMap.get(connectionId)!
                handlerSet.add(handler)
            }
            if (handlerMap.has(handler)) {
                const { id: handlerId, connectionSet } = handlerMap.get(handler)!
                connectionSet.add(connectionId)
                return handlerId
            }
            const handlerId = randomString(6)
            handlerMap.set(handler, { id: handlerId, connectionSet: new Set([connectionId]) })
            triggerMap.set(handlerId, handler)
            return handlerId
        },
        unsubscribe(connectionId: string) {
            if (subscriptionMap.has(connectionId)) {
                const { stateSet, listSet, handlerSet, unsubscribers } = subscriptionMap.get(connectionId)!
                for (const state of [...stateSet]) {
                    const { connectionSet, unsubscribe } = stateMap.get(state)!
                    connectionSet.delete(connectionId)
                    if (connectionSet.size === 0) {
                        stateMap.delete(state)
                        unsubscribe!()
                    }
                }
                for (const list of [...listSet]) {
                    const { connectionSet, unsubscribe } = listMap.get(list)!
                    connectionSet.delete(connectionId)
                    if (connectionSet.size === 0) {
                        listMap.delete(list)
                        mappedListMap.delete(list)
                        unsubscribe!()
                    }
                }
                for (const handler of [...handlerSet]) {
                    const { id: handlerId, connectionSet } = handlerMap.get(handler)!
                    connectionSet.delete(connectionId)
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
                subscriptionMap.delete(connectionId)
            }
        },
        getItemId(list: WatchableList<any>, index: number) {
            return mappedListMap.get(list)!(index).id
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

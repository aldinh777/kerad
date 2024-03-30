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
interface SubscriptionData {
    id: string
    connectionSet: Set<string>
    contextSet: Set<string>
    unsubscribe?: Unsubscribe
}
interface ListSubscriptionData extends SubscriptionData {
    mappedList: ObservedList<StoredItem>
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
    // Connection Data
    const connectionMap = new Map<string, RektContext>()
    // State Hash
    const stateMap = new Map<State, SubscriptionData>()
    // List & Item Hash
    const listMap = new Map<WatchableList<any>, ListSubscriptionData>()
    // Trigger & Handler Hash
    const handlerMap = new Map<() => any, SubscriptionData>()
    const triggerMap = new Map<string, () => any>()
    return {
        generateContext(parentContext?: RektContext) {
            const contextId = randomString(6)
            const unsubscribers: Unsubscribe[] = []
            const context: RektContext = {
                id: contextId,
                connectionId: parentContext?.connectionId || contextId,
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
                    for (const unsubscribe of unsubscribers.splice(0)) {
                        unsubscribe()
                    }
                }
            }
            if (parentContext) {
                parentContext.onMount(() => () => context.dismount())
            } else {
                connectionMap.set(contextId, context)
            }
            return context
        },
        registerState(state: State, context: RektContext) {
            if (!stateMap.has(state)) {
                const stateId = randomString(6)
                const connectionSet = new Set<string>()
                stateMap.set(state, {
                    id: stateId,
                    connectionSet: connectionSet,
                    contextSet: new Set(),
                    unsubscribe: uniqueHandlers.state(state, stateId, connectionSet)
                })
            }
            console.log([...stateMap.keys()].map((st) => st()))
            const { id: stateId, connectionSet, contextSet, unsubscribe } = stateMap.get(state)!
            console.log(state(), 'registered with id', stateId)
            if (!contextSet.has(context.id)) {
                connectionSet.add(context.connectionId)
                contextSet.add(context.id)
                context.onDismount(() => {
                    contextSet.delete(context.id)
                    if (contextSet.size === 0) {
                        connectionSet.delete(context.connectionId)
                        if (connectionSet.size === 0) {
                            connectionMap.delete(context.connectionId)
                            stateMap.delete(state)
                            unsubscribe?.()
                        }
                    }
                })
            }
            return stateId
        },
        registerList(list: WatchableList<any>, context: RektContext) {
            if (!listMap.has(list)) {
                const listId = randomString(6)
                const connectionSet = new Set<string>()
                const mappedList = maplist(list, (item) => {
                    return { item: item, context: this.generateContext(context) }
                })
                listMap.set(list, {
                    id: listId,
                    connectionSet: connectionSet,
                    contextSet: new Set(),
                    unsubscribe: uniqueHandlers.list(mappedList, listId, connectionSet),
                    mappedList: mappedList
                })
            }
            const { id: listId, connectionSet, contextSet, unsubscribe } = listMap.get(list)!
            if (!contextSet.has(context.id)) {
                connectionSet.add(context.connectionId)
                contextSet.add(context.id)
                context.onDismount(() => {
                    contextSet.delete(context.id)
                    if (contextSet.size === 0) {
                        connectionSet.delete(context.connectionId)
                        if (connectionSet.size === 0) {
                            connectionMap.delete(context.connectionId)
                            listMap.delete(list)
                            unsubscribe?.()
                        }
                    }
                })
            }
            return listId
        },
        registerHandler(handler: () => any, context: RektContext) {
            if (!handlerMap.has(handler)) {
                const handlerId = randomString(6)
                handlerMap.set(handler, {
                    id: handlerId,
                    connectionSet: new Set([context.connectionId]),
                    contextSet: new Set(context.id)
                })
                triggerMap.set(handlerId, handler)
            }
            const { id: handlerId, connectionSet, contextSet } = handlerMap.get(handler)!
            if (!contextSet.has(context.id)) {
                connectionSet.add(context.connectionId)
                contextSet.add(context.id)
                context.onDismount(() => {
                    contextSet.delete(context.id)
                    if (contextSet.size === 0) {
                        connectionSet.delete(context.connectionId)
                        if (connectionSet.size === 0) {
                            connectionMap.delete(context.connectionId)
                            handlerMap.delete(handler)
                            triggerMap.delete(handlerId)
                        }
                    }
                })
            }
            return handlerId
        },
        unsubscribe(connectionId: string) {
            if (connectionMap.has(connectionId)) {
                const context = connectionMap.get(connectionId)!
                context.dismount()
            }
        },
        getContext(list: WatchableList<any>, index: number) {
            return listMap.get(list)!.mappedList(index).context
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

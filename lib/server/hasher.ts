import type { State } from '@aldinh777/reactive'
import type { Unsubscribe } from '@aldinh777/reactive/utils/subscription'
import type { RektNode, ServerContext } from '../common/jsx-runtime'
import type { ObservedList, WatchableList } from '@aldinh777/reactive/collection/list'
import { randomString } from '@aldinh777/toolbox/random'
import { maplist } from '@aldinh777/reactive/collection/list/map'

interface UniqueHandlers {
    state: (state: State, stateId: string, connectionMap: Map<string, Set<string>>) => Unsubscribe
    list: (mappedList: ObservedList<StoredItem>, listId: string, connectionMap: Map<string, Set<string>>) => Unsubscribe
}
interface SubscriptionData {
    id: string
    connectionMap: Map<string, Set<string>>
    unsubscribe?: Unsubscribe
}
interface ListSubscriptionData extends SubscriptionData {
    mappedList: ObservedList<StoredItem>
}
interface StoredItem {
    item: RektNode | RektNode[]
    context: ServerContext
}
export interface TriggerResult {
    status: 'success' | 'not found' | 'error'
    data?: any
    error?: any
}

export function createHasher(uniqueHandlers: UniqueHandlers) {
    // Connection Data
    const contextConnectionMap = new Map<string, ServerContext>()
    // State Hash
    const stateMap = new Map<State, SubscriptionData>()
    // List & Item Hash
    const listMap = new Map<WatchableList<any>, ListSubscriptionData>()
    // Trigger & Handler Hash
    const handlerMap = new Map<() => any, SubscriptionData>()
    const triggerMap = new Map<string, () => any>()
    return {
        generateContext(parentContext?: ServerContext) {
            const contextId = randomString(6)
            const unsubscribers: Unsubscribe[] = []
            const context: ServerContext = {
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
                },
                setInterval(ms, handler) {
                    context.onMount(() => {
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
                    context.onMount(() => {
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
            if (parentContext) {
                parentContext.onDismount(() => context.dismount())
            } else {
                contextConnectionMap.set(contextId, context)
            }
            return context
        },
        registerState(state: State, context: ServerContext) {
            if (!stateMap.has(state)) {
                const stateId = randomString(6)
                const connectionMap = new Map<string, Set<string>>()
                stateMap.set(state, {
                    id: stateId,
                    connectionMap: connectionMap,
                    unsubscribe: uniqueHandlers.state(state, stateId, connectionMap)
                })
            }
            const { id: stateId, connectionMap: connectionMap, unsubscribe } = stateMap.get(state)!
            if (!connectionMap.has(context.connectionId)) {
                connectionMap.set(context.connectionId, new Set())
            }
            const contextSet = connectionMap.get(context.connectionId)!
            if (!contextSet.has(context.id)) {
                contextSet.add(context.id)
                context.onDismount(() => {
                    contextSet.delete(context.id)
                    if (contextSet.size === 0) {
                        connectionMap.delete(context.connectionId)
                        if (connectionMap.size === 0) {
                            stateMap.delete(state)
                            unsubscribe?.()
                        }
                    }
                })
            }
            return stateId
        },
        registerList(list: WatchableList<any>, context: ServerContext) {
            if (!listMap.has(list)) {
                const listId = randomString(6)
                const connectionMap = new Map<string, Set<string>>()
                const mappedList = maplist(list, (item) => {
                    return { item: item, context: this.generateContext(context) }
                })
                listMap.set(list, {
                    id: listId,
                    connectionMap: connectionMap,
                    unsubscribe: uniqueHandlers.list(mappedList, listId, connectionMap),
                    mappedList: mappedList
                })
            }
            const { id: listId, connectionMap: connectionMap, unsubscribe } = listMap.get(list)!
            if (!connectionMap.has(context.connectionId)) {
                connectionMap.set(context.connectionId, new Set())
            }
            const contextSet = connectionMap.get(context.connectionId)!
            if (!contextSet.has(context.id)) {
                contextSet.add(context.id)
                context.onDismount(() => {
                    contextSet.delete(context.id)
                    if (contextSet.size === 0) {
                        connectionMap.delete(context.connectionId)
                        if (connectionMap.size === 0) {
                            listMap.delete(list)
                            unsubscribe?.()
                        }
                    }
                })
            }
            return listId
        },
        registerHandler(handler: () => any, context: ServerContext) {
            if (!handlerMap.has(handler)) {
                const handlerId = randomString(6)
                handlerMap.set(handler, {
                    id: handlerId,
                    connectionMap: new Map()
                })
                triggerMap.set(handlerId, handler)
            }
            const { id: handlerId, connectionMap } = handlerMap.get(handler)!
            if (!connectionMap.has(context.connectionId)) {
                connectionMap.set(context.connectionId, new Set())
            }
            const contextSet = connectionMap.get(context.connectionId)!
            if (!contextSet.has(context.id)) {
                contextSet.add(context.id)
                context.onDismount(() => {
                    contextSet.delete(context.id)
                    if (contextSet.size === 0) {
                        connectionMap.delete(context.connectionId)
                        if (connectionMap.size === 0) {
                            handlerMap.delete(handler)
                            triggerMap.delete(handlerId)
                        }
                    }
                })
            }
            return handlerId
        },
        unsubscribe(connectionId: string) {
            if (contextConnectionMap.has(connectionId)) {
                const context = contextConnectionMap.get(connectionId)!
                contextConnectionMap.delete(connectionId)
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

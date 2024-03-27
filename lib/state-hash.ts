import type { State } from '@aldinh777/reactive'
import type { Unsubscribe } from '@aldinh777/reactive/utils/subscription'
import { randomString } from '@aldinh777/toolbox/random'

type uniqueHandler = (state: State, id: string, connections: Set<string>) => any
export interface ComponentContext {
    connectionId: string
    onMount(mountHandler: () => Unsubscribe | void): void
}

export function stateHash(uniqueHandler: uniqueHandler) {
    const states = new Map<State, [string, Set<string>, Unsubscribe]>()
    const subscriptions = new Map<string, [Set<State>, Unsubscribe[]]>()
    return {
        id(state: State, connectionId: string) {
            if (subscriptions.has(connectionId)) {
                const [stateSets] = subscriptions.get(connectionId)!
                stateSets.add(state)
            }
            if (states.has(state)) {
                const [id, connections] = states.get(state)!
                connections.add(connectionId)
                return id
            }
            const id = randomString(6)
            const connections = new Set([connectionId])
            const unsubscribe = uniqueHandler(state, id, connections)
            states.set(state, [id, connections, unsubscribe])
            return id
        },
        generateContext(connectionId: string) {
            const unsubscribeHandlers: Unsubscribe[] = []
            subscriptions.set(connectionId, [new Set(), unsubscribeHandlers])
            const context: ComponentContext = {
                connectionId: connectionId,
                onMount(mountHandler: () => Unsubscribe | void) {
                    const onDismount = mountHandler()
                    if (onDismount) {
                        unsubscribeHandlers.push(onDismount)
                    }
                }
            }
            return context
        },
        unsubscribe(connectionId: string) {
            if (subscriptions.has(connectionId)) {
                const [stateSets, unsubscribeHandlers] = subscriptions.get(connectionId)!
                for (const state of [...stateSets]) {
                    const [_, connections, unsubscribe] = states.get(state)!
                    connections.delete(connectionId)
                    if (connections.size === 0) {
                        states.delete(state)
                        unsubscribe()
                    }
                }
                for (const unsubscribe of unsubscribeHandlers) {
                    unsubscribe()
                }
                subscriptions.delete(connectionId)
            }
        }
    }
}

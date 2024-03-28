import type { State } from '@aldinh777/reactive'
import type { Unsubscribe } from '@aldinh777/reactive/utils/subscription'
import type { RektContext } from './jsx-runtime'
import { randomString } from '@aldinh777/toolbox/random'

type uniqueHandler = (state: State, id: string, connections: Set<string>) => any

export function createStateHasher(uniqueHandler: uniqueHandler) {
    const states = new Map<State, [string, Set<string>, Unsubscribe]>()
    const subscriptions = new Map<string, [Set<State>, Unsubscribe[]]>()
    return {
        register(state: State, connectionId: string) {
            if (subscriptions.has(connectionId)) {
                const [stateSets] = subscriptions.get(connectionId)!
                stateSets.add(state)
            }
            if (states.has(state)) {
                const [stateId, connections] = states.get(state)!
                connections.add(connectionId)
                return stateId
            }
            const stateId = randomString(6)
            const connections = new Set([connectionId])
            const unsubscribe = uniqueHandler(state, stateId, connections)
            states.set(state, [stateId, connections, unsubscribe])
            return stateId
        },
        unsubscribe(connectionId: string) {
            if (subscriptions.has(connectionId)) {
                const [stateSet, unsubscribeHandlers] = subscriptions.get(connectionId)!
                for (const state of [...stateSet]) {
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
                stateSet.clear()
                subscriptions.delete(connectionId)
            }
        },
        generateContext(newConnectionId: string) {
            const unsubscribeHandlers: Unsubscribe[] = []
            subscriptions.set(newConnectionId, [new Set(), unsubscribeHandlers])
            const context: RektContext = {
                connectionId: newConnectionId,
                onMount(mountHandler: () => Unsubscribe | void) {
                    const onDismount = mountHandler()
                    if (onDismount) {
                        unsubscribeHandlers.push(onDismount)
                    }
                }
            }
            return context
        }
    }
}

export interface TriggerResult {
    status: 'success' | 'not found' | 'error'
    data?: any
    error?: any
}

export function createHandlerHasher() {
    const handlers = new Map<string, () => any>()
    const subscriptions = new Map<string, string[]>()
    return {
        register(handler: () => any, connectionId: string) {
            const handlerId = randomString(6)
            handlers.set(handlerId, handler)
            if (subscriptions.has(connectionId)) {
                const subscription = subscriptions.get(connectionId)
                subscription!.push(handlerId)
            } else {
                subscriptions.set(connectionId, [handlerId])
            }
            return handlerId
        },
        unsubscribe(connectionId: string) {
            if (subscriptions.has(connectionId)) {
                const subscription = subscriptions.get(connectionId)
                for (const handlerId of subscription!) {
                    handlers.delete(handlerId)
                }
                subscriptions.delete(connectionId)
            }
        },
        async trigger(handlerId: string): Promise<TriggerResult> {
            if (handlers.has(handlerId)) {
                const handler = handlers.get(handlerId)
                try {
                    return { status: 'success', data: handler!() }
                } catch (error) {
                    return { status: 'error', error: error }
                }
            } else {
                return { status: 'not found' }
            }
        }
    }
}

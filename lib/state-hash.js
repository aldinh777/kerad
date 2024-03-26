import { randomString } from '@aldinh777/toolbox/random'

export function stateHash(uniqueHandler) {
    const states = new Map()
    const subscriptions = new Map()
    return {
        id(state, connectionId) {
            if (subscriptions.has(connectionId)) {
                const [stateSets] = subscriptions.get(connectionId)
                stateSets.add(state)
            }
            if (states.has(state)) {
                const [id, connections] = states.get(state)
                connections.add(connectionId)
                return id
            }
            const id = randomString(6)
            const connections = new Set([connectionId])
            const unsubscribe = uniqueHandler(state, id, connections)
            states.set(state, [id, connections, unsubscribe])
            return id
        },
        generateContext(connectionId) {
            const unsubscribeHandlers = []
            subscriptions.set(connectionId, [new Set(), unsubscribeHandlers])
            const context = {
                connectionId: connectionId,
                onMount(mountHandler) {
                    const onDismount = mountHandler()
                    unsubscribeHandlers.push(onDismount)
                }
            }
            return context
        },
        unsubscribe(connectionId) {
            if (subscriptions.has(connectionId)) {
                const [stateSets, unsubscribeHandlers] = subscriptions.get(connectionId)
                for (const state of [...stateSets]) {
                    const [_, connections, unsubscribe] = states.get(state)
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

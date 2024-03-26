import { randomString } from '@aldinh777/toolbox/random'

export function stateHash(uniqueHandler) {
    const states = new Map()
    const subscriptions = new Map()
    return {
        id(state, connectId) {
            if (subscriptions.has(connectId)) {
                const stateSets = subscriptions.get(connectId)
                stateSets.add(state)
            } else {
                subscriptions.set(connectId, new Set([state]))
            }
            if (states.has(state)) {
                const [id, connections] = states.get(state)
                connections.add(connectId)
                return id
            }
            const id = randomString(6)
            const connections = new Set([connectId])
            const unsubscribe = uniqueHandler(state, id, connections)
            states.set(state, [id, connections, unsubscribe])
            return id
        },
        unsubscribe(connectId) {
            if (subscriptions.has(connectId)) {
                const stateSets = subscriptions.get(connectId)
                for (const state of [...stateSets]) {
                    const [_, connections, unsubscribe] = states.get(state)
                    connections.delete(connectId)
                    if (connections.size === 0) {
                        states.delete(state)
                        unsubscribe()
                    }
                }
            }
        }
    }
}

import type { State } from '@aldinh777/reactive'
import type { ServerContext } from '@aldinh777/rekt-jsx/jsx-runtime'
import { createIdGenerator, handleContextData, uniqueHandlers, type SubscriptionData } from './utils'

const stateMap = new Map<State, SubscriptionData>()
const stateIdGenerator = createIdGenerator()

export function registerState(state: State, context: ServerContext) {
    return handleContextData(context, stateMap, state, {
        onCreate() {
            const stateId = stateIdGenerator.next()
            const connectionMap = new Map<string, Set<string>>()
            return {
                id: stateId,
                connectionMap: connectionMap,
                unsubscribe: uniqueHandlers.state?.(state, stateId, connectionMap)
            }
        },
        onEmpty(stateId) {
            stateIdGenerator.delete(stateId)
        }
    })
}

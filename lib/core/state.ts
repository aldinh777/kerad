import type { State } from '@aldinh777/reactive';
import type { SubscriptionData } from './utils.ts';
import { createIdGenerator, handleContextData, ServerContext, uniqueHandlers } from './utils.ts';

const stateMap = new Map<State, SubscriptionData>();
const stateIdGenerator = createIdGenerator();

export function registerState(state: State, context: ServerContext) {
    return handleContextData(context, stateMap, state, {
        onCreate() {
            const stateId = stateIdGenerator.next();
            const connectionMap = new Map<string, Set<string>>();
            return {
                id: stateId,
                connectionMap: connectionMap,
                unsubscribe: uniqueHandlers.state?.(state, stateId, connectionMap)
            };
        },
        onEmpty(stateId) {
            stateIdGenerator.delete(stateId);
        }
    });
}

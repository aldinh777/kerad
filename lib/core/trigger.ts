import type { ServerContext, SubscriptionData } from './utils.ts';
import { createIdGenerator, handleContextData } from './utils';

const handlerMap = new Map<(value: string) => any, SubscriptionData>();
const triggerMap = new Map<string, (value: string) => any>();
const triggerIdGenerator = createIdGenerator();

export function registerTriggerHandler(handler: (value?: string) => any, context: ServerContext) {
    return handleContextData(context, handlerMap, handler, {
        onCreate() {
            const handlerId = triggerIdGenerator.next();
            triggerMap.set(handlerId, handler);
            return {
                id: handlerId,
                connectionMap: new Map()
            };
        },
        onEmpty(handlerId) {
            triggerMap.delete(handlerId);
            triggerIdGenerator.delete(handlerId);
        }
    });
}

export function triggerHandler(handlerId: string, value: string) {
    if (!triggerMap.has(handlerId)) {
        return { result: 'not found' };
    }
    try {
        triggerMap.get(handlerId)!(value);
        return { result: 'ok' };
    } catch (error) {
        return { result: 'error', error };
    }
}

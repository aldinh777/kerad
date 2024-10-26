import type { State } from '@aldinh777/reactive';
import type { WatchableList } from '@aldinh777/reactive/watchable';
import type { IdGenerator, StoredItem, SubscriptionData } from './utils.ts';
import { createIdGenerator, handleContextData, ServerContext, uniqueHandlers } from './utils.ts';

// Reactive State

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

// Reactive List

interface ListSubscriptionData extends SubscriptionData {
    mappedList: WatchableList<StoredItem>;
}

const listMap = new Map<WatchableList<any>, ListSubscriptionData>();
const listIdGenerator = createIdGenerator();

function createSubContext(parentContext: ServerContext, itemIdGenerator: IdGenerator) {
    const contextId = itemIdGenerator.next();
    const context = new ServerContext(contextId, parentContext.connection, parentContext.params);
    context.onDismount(() => itemIdGenerator.delete(contextId));
    parentContext.onDismount(() => context.dismount());
    return context;
}

export function registerList(list: WatchableList<any>, context: ServerContext) {
    return handleContextData(context, listMap, list, {
        onCreate() {
            const listId = listIdGenerator.next();
            const connectionMap = new Map<string, Set<string>>();
            const itemIdGenerator = createIdGenerator();
            const mappedList = list.map((item) => ({
                item: item,
                context: createSubContext(context, itemIdGenerator)
            }));
            return {
                id: listId,
                connectionMap: connectionMap,
                unsubscribe: uniqueHandlers.list?.(mappedList, listId, connectionMap),
                mappedList: mappedList
            };
        },
        onEmpty(listId) {
            listIdGenerator.delete(listId);
        }
    });
}

export function getListItem(list: WatchableList<any>, index: number) {
    return listMap.get(list)!.mappedList(index);
}

import type { State } from '@aldinh777/reactive';
import type { WatchableList } from '@aldinh777/reactive/list-utils';
import type { IdGenerator, StoredItem, SubscriptionData } from './utils.ts';
import { createIdGenerator, handleContextData, ServerContext, uniqueHandlers } from './utils.ts';

// Reactive State

interface StateSubscriptionData extends SubscriptionData {
    subContext: ServerContext | undefined;
}

const stateMap = new Map<State, StateSubscriptionData>();
const stateIdGenerator = createIdGenerator();

export function registerState(state: State, context: ServerContext) {
    return handleContextData(context, stateMap, state, {
        onCreate() {
            const stateId = stateIdGenerator.next();
            const connectionMap = new Map<string, Set<string>>();
            const val = state();
            let subContext: ServerContext | undefined;
            if (val instanceof Object) {
                subContext = new ServerContext(context.cid, stateId, context.req, context.url, context.params);
                context.onDismount(() => subContext?.dismount());
            }
            return {
                id: stateId,
                connectionMap: connectionMap,
                unsubscribe: uniqueHandlers.state?.(state, stateId, connectionMap, subContext),
                subContext: subContext
            };
        },
        onEmpty(stateId) {
            stateIdGenerator.delete(stateId);
        }
    });
}

export function getSubContext(state: State) {
    return stateMap.get(state)!.subContext;
}

// Reactive List

interface ListSubscriptionData extends SubscriptionData {
    mappedList: WatchableList<StoredItem>;
}

const listMap = new Map<WatchableList<any>, ListSubscriptionData>();
const listIdGenerator = createIdGenerator();

function createSubContext(parentContext: ServerContext, itemIdGenerator: IdGenerator) {
    const contextId = itemIdGenerator.next();
    const context = new ServerContext(
        parentContext.cid,
        contextId,
        parentContext.req,
        parentContext.url,
        parentContext.params
    );
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

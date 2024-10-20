import type { ObservedList, WatchableList } from '@aldinh777/reactive/watchable';
import type { SubscriptionData, StoredItem, IdGenerator } from './utils.ts';
import { handleContextData, createIdGenerator, uniqueHandlers, ServerContext } from './utils.ts';

interface ListSubscriptionData extends SubscriptionData {
    mappedList: ObservedList<StoredItem>;
}

const listMap = new Map<WatchableList<any>, ListSubscriptionData>();
const listIdGenerator = createIdGenerator();

function createSubContext(parentContext: ServerContext, itemIdGenerator: IdGenerator) {
    const contextId = itemIdGenerator.next();
    const context = new ServerContext(contextId, parentContext);
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

import type { ObservedList, WatchableList } from '@aldinh777/reactive/list/watchable'
import type { ServerContext } from '@aldinh777/rekt-jsx'
import type { SubscriptionData, StoredItem, IdGenerator } from './utils'
import { map } from '@aldinh777/reactive/list/utils'
import { createContext } from '@aldinh777/rekt-jsx'
import { handleContextData, createIdGenerator, uniqueHandlers } from './utils'

interface ListSubscriptionData extends SubscriptionData {
    mappedList: ObservedList<StoredItem>
}

const listMap = new Map<WatchableList<any>, ListSubscriptionData>()
const listIdGenerator = createIdGenerator()

function createSubContext(parentContext: ServerContext, itemIdGenerator: IdGenerator) {
    const contextId = itemIdGenerator.next()
    const context: ServerContext = {
        ...parentContext,
        ...createContext(),
        _id: contextId,
    }
    context.onDismount(() => itemIdGenerator.delete(contextId))
    parentContext.onDismount(() => context.dismount())
    return context
}

export function registerList(list: WatchableList<any>, context: ServerContext) {
    return handleContextData(context, listMap, list, {
        onCreate() {
            const listId = listIdGenerator.next()
            const connectionMap = new Map<string, Set<string>>()
            const itemIdGenerator = createIdGenerator()
            const mappedList = map(list, (item) => ({
                item: item,
                context: createSubContext(context, itemIdGenerator)
            }))
            return {
                id: listId,
                connectionMap: connectionMap,
                unsubscribe: uniqueHandlers.list?.(mappedList, listId, connectionMap),
                mappedList: mappedList
            }
        },
        onEmpty(listId) {
            listIdGenerator.delete(listId)
        }
    })
}

export function getListItem(list: WatchableList<any>, index: number) {
    return listMap.get(list)!.mappedList(index)
}

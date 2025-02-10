import type { ClassList } from './common';
import type { SubscriptionData } from './utils.ts';
import { createIdGenerator, handleContextData, ServerContext, uniqueHandlers } from './utils.ts';

const classListMap = new Map<ClassList, SubscriptionData>();
const classListIdGenerator = createIdGenerator();

export function registerClassList(classList: ClassList, context: ServerContext) {
    return handleContextData(context, classListMap, classList, {
        onCreate() {
            const classListId = classListIdGenerator.next();
            const connectionMap = new Map<string, Set<string>>();
            return {
                id: classListId,
                connectionMap: connectionMap,
                unsubscribe: uniqueHandlers.classList?.(classList, classListId, connectionMap)
            };
        },
        onEmpty(id) {
            classListIdGenerator.delete(id);
        }
    });
}

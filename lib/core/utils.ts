import type { State } from '@aldinh777/reactive';
import type { WatchableList } from '@aldinh777/reactive/list-utils';
import type { Node } from '@aldinh777/kerad/jsx';
import { ClassList, Context } from './common.ts';
import { sessionByCookie } from './session.ts';

const randomString = (length: number = 1) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

interface ResponseData {
    status: number;
    headers: Record<string, string>;
}

export class ServerContext extends Context {
    id: string;
    url: URL;
    req: Request;
    res: ResponseData = { status: 200, headers: {} };
    params: Record<string, string | undefined>;
    session: ReturnType<typeof sessionByCookie>;
    constructor(id: string, req: Request, url: URL, params: Record<string, string | undefined> = {}) {
        super();
        this.id = id;
        this.req = req;
        this.url = url;
        this.params = params;
        this.session = sessionByCookie(this);
    }
}

export interface SubscriptionData {
    id: string;
    connectionMap: Map<string, Set<string>>;
    unsubscribe?: () => void;
}
export interface StoredItem {
    item: Node | Node[];
    context: ServerContext;
}
export interface IdGenerator {
    next(): string;
    delete(id: string): void;
}
interface ContextDataHandler {
    onCreate(): SubscriptionData;
    onEmpty(id: string): any;
}
interface UniqueHandlers {
    state?: (
        state: State,
        stateId: string,
        connections: Map<string, Set<string>>,
        subContext?: ServerContext
    ) => () => void;
    list?: (mappedList: WatchableList<StoredItem>, listId: string, connections: Map<string, Set<string>>) => () => void;
    classList?: (classList: ClassList, classListId: string, connections: Map<string, Set<string>>) => () => void;
}

export const uniqueHandlers: UniqueHandlers = {};

export function setRegistryHandler(handler: UniqueHandlers) {
    uniqueHandlers.state = handler.state;
    uniqueHandlers.list = handler.list;
    uniqueHandlers.classList = handler.classList;
}

export function createIdGenerator(defaultSize: number = 4): IdGenerator {
    const set = new Set<string>();
    return {
        next() {
            let id = randomString(defaultSize);
            while (set.has(id)) {
                id += randomString();
            }
            set.add(id);
            return id;
        },
        delete(id: string) {
            set.delete(id);
        }
    };
}

export function handleContextData<T>(
    context: ServerContext,
    map: Map<T, SubscriptionData>,
    item: T,
    handlers: ContextDataHandler
): string {
    if (!map.has(item)) {
        map.set(item, handlers.onCreate());
    }
    const { id, connectionMap, unsubscribe } = map.get(item)!;
    const cid = context.id;
    if (!connectionMap.has(cid)) {
        connectionMap.set(cid, new Set());
    }
    const contextSet = connectionMap.get(cid)!;
    if (!contextSet.has(context.id)) {
        contextSet.add(context.id);
        context.onDismount(() => {
            contextSet.delete(context.id);
            if (contextSet.size === 0) {
                connectionMap.delete(cid);
                if (connectionMap.size === 0) {
                    map.delete(item);
                    handlers.onEmpty(id);
                    unsubscribe?.();
                }
            }
        });
    }
    return id;
}

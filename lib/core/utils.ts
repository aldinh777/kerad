import type { State } from '@aldinh777/reactive';
import type { ObservedList } from '@aldinh777/reactive/watchable';
import type { Unsubscribe } from '@aldinh777/reactive/subscription';
import type { Node } from '@aldinh777/kerad-jsx';

const randomString = (length: number = 1) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

export class Context {
    unsubscribers: Unsubscribe[] = [];
    onMount(mountHandler: () => void | Unsubscribe) {
        const dismountHandler = mountHandler();
        if (dismountHandler) {
            this.onDismount(dismountHandler);
        }
    }
    onDismount(dismountHandler: Unsubscribe) {
        this.unsubscribers.push(dismountHandler);
    }
    dismount(): void {
        for (const unsubscribe of this.unsubscribers.splice(0)) {
            unsubscribe();
        }
    }
}

interface ResponseData {
    headers: Record<string, string>;
    status: number;
    statusText: string;
}

export interface ServerInterface {
    _cid: string;
    request: Request;
    responseData: ResponseData;
    params: Record<string, string>;
}

export class ServerContext extends Context implements ServerInterface {
    _id: string;
    _cid: string;
    request: Request;
    responseData: ResponseData;
    params: Record<string, string>;
    constructor(id: string, content: ServerInterface) {
        super();
        this._id = id;
        this._cid = content._cid;
        this.request = content.request;
        this.responseData = content.responseData;
        this.params = content.params;
    }
}

export interface SubscriptionData {
    id: string;
    connectionMap: Map<string, Set<string>>;
    unsubscribe?: Unsubscribe;
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
    state?: (state: State, stateId: string, connections: Map<string, Set<string>>) => Unsubscribe;
    list?: (mappedList: ObservedList<StoredItem>, listId: string, connections: Map<string, Set<string>>) => Unsubscribe;
}

export const uniqueHandlers: UniqueHandlers = {};

export function setRegistryHandler(handler: UniqueHandlers) {
    uniqueHandlers.state = handler.state;
    uniqueHandlers.list = handler.list;
}

export function createIdGenerator(): IdGenerator {
    const set = new Set<string>();
    return {
        next() {
            let id = randomString(3);
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
    if (!connectionMap.has(context._cid)) {
        connectionMap.set(context._cid, new Set());
    }
    const contextSet = connectionMap.get(context._cid)!;
    if (!contextSet.has(context._id)) {
        contextSet.add(context._id);
        context.onDismount(() => {
            contextSet.delete(context._id);
            if (contextSet.size === 0) {
                connectionMap.delete(context._cid);
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
import type { Context } from '@hono/hono';
import { ServerContext, createIdGenerator } from './utils';

const contextConnectionMap = new Map<string, ServerContext>();
const connectionIdGenerator = createIdGenerator();

export function registerConnection(connection: Context, params: Record<string, string> = {}) {
    const contextId = connectionIdGenerator.next();
    connection.set('_cid', contextId);
    const context = new ServerContext(contextId, connection, params);
    contextConnectionMap.set(contextId, context);
    return context;
}

export function hasConnection(connectionId: string) {
    return contextConnectionMap.has(connectionId);
}

export function unregisterConnection(connectionId: string) {
    if (contextConnectionMap.has(connectionId)) {
        const context = contextConnectionMap.get(connectionId)!;
        contextConnectionMap.delete(connectionId);
        connectionIdGenerator.delete(connectionId);
        context.dismount();
    }
}

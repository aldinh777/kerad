import { ServerContext, createIdGenerator } from './utils';

const contextConnectionMap = new Map<string, ServerContext>();
const connectionIdGenerator = createIdGenerator();

export function registerConnection(req: Request, url: URL, params: Record<string, string> = {}) {
    const contextId = connectionIdGenerator.next();
    const context = new ServerContext(contextId, contextId, req, url, params);
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

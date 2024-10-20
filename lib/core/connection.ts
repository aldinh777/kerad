import { ServerContext, createIdGenerator } from "./utils";

const contextConnectionMap = new Map<string, ServerContext>();
const connectionIdGenerator = createIdGenerator();

export function registerConnection(req: Request, params: Record<string, string>) {
    const contextId = connectionIdGenerator.next();
    const context = new ServerContext(contextId, {
        _cid: contextId,
        request: req,
        responseData: {
            headers: {},
            status: 200,
            statusText: 'ok'
        },
        params
    });
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

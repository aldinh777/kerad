import type { ServerContext } from '@aldinh777/rekt-jsx/jsx-runtime'
import { createContext } from '@aldinh777/rekt-jsx/jsx-runtime'
import { createIdGenerator } from './utils'

const contextConnectionMap = new Map<string, ServerContext>()
const connectionIdGenerator = createIdGenerator()

export function registerConnection(req: Request, data: any) {
    const contextId = connectionIdGenerator.next()
    const context: ServerContext = {
        id: contextId,
        connectionId: contextId,
        request: req,
        data: data,
        setHeader: function (name: string, value: string): void {
            data.response ??= {}
            data.response.headers ??= {}
            data.response.headers[name] = value
        },
        setStatus: function (status: number, statusText: string): void {
            data.response ??= {}
            data.response.status ??= status
            data.response.status ??= statusText
        },
        ...createContext()
    }
    contextConnectionMap.set(contextId, context)
    return context
}

export function hasConnection(connectionId: string) {
    return contextConnectionMap.has(connectionId)
}

export function unregisterConnection(connectionId: string) {
    if (contextConnectionMap.has(connectionId)) {
        const context = contextConnectionMap.get(connectionId)!
        contextConnectionMap.delete(connectionId)
        connectionIdGenerator.delete(connectionId)
        context.dismount()
    }
}

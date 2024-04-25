import { hasConnection, unregisterConnection } from './registry/connection'

const pushMap = new Map<string, (event: string, payload: string[]) => any>()

export function serveSSE(req: Request, cid: string) {
    if (!hasConnection(cid)) {
        return new Response('not found', { status: 404 })
    }
    return new Response(
        new ReadableStream({
            start(controller) {
                controller.enqueue(`event:init\ndata:"ok"\n\n`)
                pushMap.set(cid, (event, payload) => {
                    const eventStream = `event:${event}`
                    const dataStream = `data:${JSON.stringify(payload)}`
                    controller.enqueue(`${eventStream}\n${dataStream}\n\n`)
                })
                req.signal.onabort = () => {
                    pushMap.delete(cid)
                    unregisterConnection(cid)
                    controller.close()
                }
            }
        }),
        {
            status: 200,
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive'
            }
        }
    )
}

function publish(connections: Iterable<string>, eventName: string, payloads: string[]) {
    for (const connection of connections) {
        const push = pushMap.get(connection)
        push?.(eventName, payloads)
    }
}

export function pushStateChange(connections: Iterable<string>, value: string, stateId: string) {
    publish(connections, 'change', [stateId, value])
}

export function pushListUpdate(connections: Iterable<string>, listId: string, itemId: string, prevId: string) {
    publish(connections, 'update', [listId, itemId, prevId])
}

export function pushListInsert(connections: Iterable<string>, listId: string, itemId: string, insertBeforeId: string) {
    publish(connections, 'insert', [listId, itemId, insertBeforeId])
}

export function pushListInsertLast(connections: Iterable<string>, listId: string, itemId: string) {
    publish(connections, 'push', [listId, itemId])
}

export function pushListDelete(connections: Iterable<string>, listId: string, itemId: string) {
    publish(connections, 'delete', [listId, itemId])
}

export function pushRedirect(connection: string, url?: string) {
    if (connection === '*') {
        publish(pushMap.keys(), 'redirect', [])
    } else {
        publish([connection], 'redirect', url ? [url] : [])
    }
}

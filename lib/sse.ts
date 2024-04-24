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

function publish(topics: Iterable<string>, eventName: string, payloads: string[]) {
    for (const topic of topics) {
        const push = pushMap.get(topic)
        push?.(eventName, payloads)
    }
}

export function pushStateChange(topics: Iterable<string>, value: string, stateId: string) {
    publish(topics, 'change', [stateId, value])
}

export function pushListUpdate(topics: Iterable<string>, listId: string, itemId: string, prevId: string) {
    publish(topics, 'update', [listId, itemId, prevId])
}

export function pushListInsert(topics: Iterable<string>, listId: string, itemId: string, insertBeforeId: string) {
    publish(topics, 'insert', [listId, itemId, insertBeforeId])
}

export function pushListInsertLast(topics: Iterable<string>, listId: string, itemId: string) {
    publish(topics, 'push', [listId, itemId])
}

export function pushListDelete(topics: Iterable<string>, listId: string, itemId: string) {
    publish(topics, 'delete', [listId, itemId])
}

export function pushRedirect(topic: string, url?: string) {
    if (topic === '*') {
        publish(pushMap.keys(), 'redirect', [])
    } else {
        publish([topic], 'redirect', url ? [url] : [])
    }
}

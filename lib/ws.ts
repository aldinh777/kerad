import type { Server, WebSocketHandler } from 'bun';
import { unregisterConnection } from '@aldinh777/kerad-core';

interface ConnectionData {
    cid: string;
}

class WebSocketMiddleware {
    server?: Server;
    handlers = [];
    fetch(req: Request, server: Server) {
        const url = new URL(req.url);
        const cid = url.searchParams.get('cid');
        if (url.pathname === '/connect' && cid) {
            const upgrade = server.upgrade(req, { data: { cid } });
            if (upgrade) {
                return new Response(null, { status: 101 });
            } else {
                return new Response('Upgrade failed :(', { status: 500 });
            }
        }
    }
    socketHandler: WebSocketHandler<ConnectionData> = {
        open(socket) {
            socket.subscribe('hr');
            socket.subscribe(socket.data.cid);
        },
        message() {},
        close(socket) {
            const { cid } = socket.data;
            socket.unsubscribe('hr');
            socket.unsubscribe(cid);
            unregisterConnection(cid);
        }
    };
}

export const ws = new WebSocketMiddleware();

function publish(topics: Iterable<string>, ...payloads: string[]) {
    for (const topic of topics) {
        ws.server?.publish(topic, [...payloads].join(':'));
    }
}

export function pushStateChange(topics: Iterable<string>, value: string, stateId: string) {
    publish(topics, 'c', stateId, value);
}

export function pushElementChange(topics: Iterable<string>, stateId: string) {
    publish(topics, 'e', stateId);
}

export function pushListUpdate(topics: Iterable<string>, listId: string, itemId: string, prevId: string) {
    publish(topics, 'u', listId, itemId, prevId);
}

export function pushListInsert(topics: Iterable<string>, listId: string, itemId: string, insertBeforeId: string) {
    publish(topics, 'i', listId, itemId, insertBeforeId);
}

export function pushListInsertLast(topics: Iterable<string>, listId: string, itemId: string) {
    publish(topics, 'l', listId, itemId);
}

export function pushListDelete(topics: Iterable<string>, listId: string, itemId: string) {
    publish(topics, 'd', listId, itemId);
}

export function pushRedirect(topic: string, url: string) {
    publish([topic], 'r', url);
}

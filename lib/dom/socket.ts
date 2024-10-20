import { destroyListItem, insertListItem, replaceListItem, updateState } from './bindings';

function hotReload(wsReloadHost: string) {
    const hotReloadsocket = new WebSocket(`ws://${wsReloadHost}/hr`);
    hotReloadsocket.addEventListener('message', () => location.reload());
}

const PORT_DATA_ENDPOINT = '/kerad/port-data';
const PARTIAL_ENDPOINT = '/kerad/partial';

export async function initSocket() {
    const res = await fetch(PORT_DATA_ENDPOINT);
    const port = await res.json();
    const cid = document.body.getAttribute('kerad-cid')!;
    const wsHost = `${location.hostname}:${port['WS']}`;
    const socket = new WebSocket(`ws://${wsHost}/connect?cid=${cid}`);
    if (port['WSRELOAD']) {
        hotReload(`${location.hostname}:${port['WSRELOAD']}`);
    }
    socket.addEventListener('message', ({ data }) => {
        const [code] = data.split(':', 1);
        if (code === 'c') {
            const [stateId] = data.slice(2).split(':', 1);
            const value = data.slice(stateId.length + 3);
            updateState(stateId, value);
        } else if (code === 'u') {
            const [listId, itemId, replaceId] = data.slice(2).split(':');
            fetch(`${PARTIAL_ENDPOINT}?id=${listId}-${itemId}`, { headers: { 'Connection-ID': cid } })
                .then((res) => res.text())
                .then((htmlText) => replaceListItem(htmlText, listId, itemId, replaceId));
        } else if (code === 'i') {
            const [listId, itemId, nextItemId] = data.slice(2).split(':');
            fetch(`${PARTIAL_ENDPOINT}?id=${listId}-${itemId}`, { headers: { 'Connection-ID': cid } })
                .then((res) => res.text())
                .then((htmlText) => insertListItem(htmlText, listId, itemId, nextItemId));
        } else if (code === 'l') {
            const [listId, itemId] = data.slice(2).split(':');
            fetch(`${PARTIAL_ENDPOINT}?id=${listId}-${itemId}`, { headers: { 'Connection-ID': cid } })
                .then((res) => res.text())
                .then((htmlText) => insertListItem(htmlText, listId, itemId));
        } else if (code === 'd') {
            const [listId, itemId] = data.slice(2).split(':');
            destroyListItem(listId, itemId);
        } else if (code === 'r') {
            const redirectUrl = data.slice(2);
            location.href = redirectUrl;
        }
    });
}

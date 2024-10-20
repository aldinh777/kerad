import { destroyListItem, insertListItem, replaceListItem, updateState } from './bindings.ts';

const PARTIAL_ENDPOINT = '/rekt/partial';

export function subscribeServerEvents() {
    const cid = document.body.getAttribute('rekt-cid')!;
    const serverEvents = new EventSource(`/rekt/events?cid=${cid}`);

    serverEvents.addEventListener('change', (ev) => {
        const [stateId, value] = JSON.parse(ev.data);
        updateState(stateId, value);
    });
    serverEvents.addEventListener('update', (ev) => {
        const [listId, itemId, replaceId] = JSON.parse(ev.data);
        fetch(`${PARTIAL_ENDPOINT}?id=${listId}-${itemId}`, { headers: { 'Connection-ID': cid } })
            .then((res) => res.text())
            .then((htmlText) => replaceListItem(htmlText, listId, itemId, replaceId));
    });
    serverEvents.addEventListener('insert', (ev) => {
        const [listId, itemId, nextItemId] = JSON.parse(ev.data);
        fetch(`${PARTIAL_ENDPOINT}?id=${listId}-${itemId}`, { headers: { 'Connection-ID': cid } })
            .then((res) => res.text())
            .then((htmlText) => insertListItem(htmlText, listId, itemId, nextItemId));
    });
    serverEvents.addEventListener('push', (ev) => {
        const [listId, itemId] = JSON.parse(ev.data);
        fetch(`${PARTIAL_ENDPOINT}?id=${listId}-${itemId}`, { headers: { 'Connection-ID': cid } })
            .then((res) => res.text())
            .then((htmlText) => insertListItem(htmlText, listId, itemId));
    });
    serverEvents.addEventListener('delete', (ev) => {
        const [listId, itemId] = JSON.parse(ev.data);
        destroyListItem(listId, itemId);
    });
    serverEvents.addEventListener('redirect', (ev) => {
        const [url] = JSON.parse(ev.data);
        const redirectUrl = url || location.href;
        location.href = redirectUrl;
    });
}

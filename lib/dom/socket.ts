import { destroyListItem, insertListItem, replaceListItem, updateState, updateElement } from './bindings';

const PARTIAL_ENDPOINT = '/kerad/partial';

const SIGNAL = {
    STATE_CHANGE: 'c',
    ELEMENT_CHANGE: 'e',
    LIST_UPDATE: 'u',
    LIST_INSERT: 'i',
    LIST_INSERT_LAST: 'l',
    LIST_DELETE: 'd',
    REDIRECT: 'r'
};

function fetchPartial(response: Response) {
    if (!response.ok) {
        throw new Error('failed to fetch partial');
    }
    return response.text();
}

export async function initSocket() {
    const cid = document.body.getAttribute('kerad-cid')!;
    const socket = new WebSocket(`ws://${location.host}/connect?cid=${cid}`);
    socket.addEventListener('message', ({ data }) => {
        const [code] = data.split(':', 1);
        switch (code) {
            case SIGNAL.STATE_CHANGE:
                const [stateChangeId] = data.slice(2).split(':', 1);
                const stateChangeValue = data.slice(stateChangeId.length + 3);
                updateState(stateChangeId, JSON.parse(stateChangeValue));
                break;
            case SIGNAL.ELEMENT_CHANGE:
                const [elementChangeId] = data.slice(2).split(':', 1);
                const elementPartial = `${PARTIAL_ENDPOINT}?id=${elementChangeId}`;
                fetch(elementPartial, { headers: { 'Connection-ID': cid } })
                    .then(fetchPartial)
                    .then((htmlText) => updateElement(elementChangeId, htmlText));
                break;
            case SIGNAL.LIST_UPDATE:
                const [listUpdateId, itemUpdateId, replaceUpdateId] = data.slice(2).split(':');
                const listPartial = `${PARTIAL_ENDPOINT}?id=${listUpdateId}-${itemUpdateId}`;
                fetch(listPartial, { headers: { 'Connection-ID': cid } })
                    .then(fetchPartial)
                    .then((htmlText) => replaceListItem(htmlText, listUpdateId, itemUpdateId, replaceUpdateId));
                break;
            case SIGNAL.LIST_INSERT:
                const [listInsertId, itemInsertId, nextInsertId] = data.slice(2).split(':');
                const itemPartial = `${PARTIAL_ENDPOINT}?id=${listInsertId}-${itemInsertId}`;
                fetch(itemPartial, { headers: { 'Connection-ID': cid } })
                    .then(fetchPartial)
                    .then((htmlText) => insertListItem(htmlText, listInsertId, itemInsertId, nextInsertId));
                break;
            case SIGNAL.LIST_INSERT_LAST:
                const [listInsertLastId, itemInsertLastId] = data.slice(2).split(':');
                const lastItemPartial = `${PARTIAL_ENDPOINT}?id=${listInsertLastId}-${itemInsertLastId}`;
                fetch(lastItemPartial, { headers: { 'Connection-ID': cid } })
                    .then(fetchPartial)
                    .then((htmlText) => insertListItem(htmlText, listInsertLastId, itemInsertLastId));
                break;
            case SIGNAL.LIST_DELETE:
                const [listDeleteId, itemDeleteId] = data.slice(2).split(':');
                destroyListItem(listDeleteId, itemDeleteId);
                break;
            case SIGNAL.REDIRECT:
                const redirectUrl = data.slice(2);
                if (redirectUrl) {
                    location.href = redirectUrl;
                } else {
                    location.reload();
                }
                break;
        }
    });
}

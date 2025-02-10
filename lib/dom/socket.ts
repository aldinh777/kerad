import {
    destroyListItem,
    insertListItem,
    replaceListItem,
    updateState,
    updateElement,
    updateClassList
} from './bindings.ts';

const PARTIAL_ENDPOINT = '/kerad/partial';

const SIGNAL = {
    STATE_CHANGE: 'c',
    ELEMENT_CHANGE: 'e',
    CLASS_LIST_UPDATE: 'cl',
    LIST_UPDATE: 'u',
    LIST_INSERT: 'i',
    LIST_INSERT_LAST: 'l',
    LIST_DELETE: 'd',
    REDIRECT: 'r'
};

const PARTIAL_QUEUE = new Set<string>();

const addQueue = (partialId: string) => PARTIAL_QUEUE.add(partialId);
const removeQueue = (partialId: string) => PARTIAL_QUEUE.delete(partialId);

const fetchPartial = (partialId: string) => (response: Response) => {
    if (!response.ok) {
        PARTIAL_QUEUE.delete(partialId);
        throw new Error('failed to fetch partial');
    }
    if (!PARTIAL_QUEUE.has(partialId)) {
        throw new Error('partial removed from queue');
    }
    return response.text();
};

export function initSocket() {
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
                addQueue(elementChangeId);
                fetch(`${PARTIAL_ENDPOINT}?id=${elementChangeId}`, { headers: { 'Connection-ID': cid } })
                    .then(fetchPartial(elementChangeId))
                    .then((htmlText) => updateElement(elementChangeId, htmlText))
                    .then(() => removeQueue(elementChangeId));
                break;
            case SIGNAL.CLASS_LIST_UPDATE:
                const [classListUpdateId, oldClassName, newClassName] = data.slice(3).split(':');
                updateClassList(classListUpdateId, oldClassName, newClassName);
                break;
            case SIGNAL.LIST_UPDATE:
                const [listUpdateId, itemUpdateId, replaceUpdateId] = data.slice(2).split(':');
                const updatePartialId = `${listUpdateId}-${itemUpdateId}`;
                addQueue(updatePartialId);
                fetch(`${PARTIAL_ENDPOINT}?id=${updatePartialId}`, { headers: { 'Connection-ID': cid } })
                    .then(fetchPartial(updatePartialId))
                    .then((htmlText) => replaceListItem(htmlText, listUpdateId, itemUpdateId, replaceUpdateId))
                    .then(() => removeQueue(updatePartialId));
                break;
            case SIGNAL.LIST_INSERT:
                const [listInsertId, itemInsertId, nextInsertId] = data.slice(2).split(':');
                const insertPartialId = `${listInsertId}-${itemInsertId}`;
                addQueue(insertPartialId);
                fetch(`${PARTIAL_ENDPOINT}?id=${insertPartialId}`, { headers: { 'Connection-ID': cid } })
                    .then(fetchPartial(insertPartialId))
                    .then((htmlText) => insertListItem(htmlText, listInsertId, itemInsertId, nextInsertId))
                    .then(() => removeQueue(insertPartialId));
                break;
            case SIGNAL.LIST_INSERT_LAST:
                const [listInsertLastId, itemInsertLastId] = data.slice(2).split(':');
                const itemLastPartialId = `${listInsertLastId}-${itemInsertLastId}`;
                addQueue(itemLastPartialId);
                fetch(`${PARTIAL_ENDPOINT}?id=${itemLastPartialId}`, { headers: { 'Connection-ID': cid } })
                    .then(fetchPartial(itemLastPartialId))
                    .then((htmlText) => insertListItem(htmlText, listInsertLastId, itemInsertLastId))
                    .then(() => removeQueue(itemLastPartialId));
                break;
            case SIGNAL.LIST_DELETE:
                const [listDeleteId, itemDeleteId] = data.slice(2).split(':');
                const listItemDeleteId = `${listDeleteId}-${itemDeleteId}`;
                if (PARTIAL_QUEUE.has(listItemDeleteId)) {
                    PARTIAL_QUEUE.delete(listItemDeleteId);
                } else {
                    destroyListItem(listDeleteId, itemDeleteId);
                }
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

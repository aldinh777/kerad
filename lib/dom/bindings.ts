import type { Component } from '@aldinh777/kerad-jsx';
import { Context } from '@aldinh777/kerad-core/context.ts';
import { destroyElements, renderDom, select, selectAll, setProperty, text } from './dom.ts';

interface BindData {
    elem: HTMLElement;
    prop: string;
}
interface ElementBorderData {
    context: Context;
    begin: Text;
    end: Text;
}
interface ListElementData extends ElementBorderData {
    items: Map<string, ElementBorderData>;
}

const TRIGGER_ENDPOINT = '/kerad/trigger';
const SUBMIT_ENDPOINT = '/kerad/submit';

const stateBindings = new Map<string, BindData[]>();
const listBindings = new Map<string, ListElementData>();

function removeFromArray<T>(arr: T[], item: T) {
    const index = arr.indexOf(item);
    if (index > -1) {
        arr.splice(index, 1);
    }
}

function setBinding(stateId: string, elem: any, prop: string) {
    if (!stateBindings.has(stateId)) {
        stateBindings.set(stateId, []);
    }
    const bindings = stateBindings.get(stateId)!;
    const item = { elem, prop };
    bindings.push(item);
    return () => {
        removeFromArray(bindings, item);
        if (!bindings.length) {
            stateBindings.delete(stateId);
        }
    };
}

function bindClientComponent(node: HTMLElement | Document, context: Context) {
    for (const elem of selectAll('kerad-client[src]', node)) {
        const src = elem.getAttribute('src');
        if (!src) {
            continue;
        }
        import(src.replace(/\.tsx$/, '.js')).then(async (Comp: { default: Component }) => {
            const componentContext = new Context();
            elem.innerHTML = '';
            renderDom(elem, await Comp.default({}, componentContext), context);
            context.onDismount(() => componentContext.dismount());
        });
    }
}

function bindState(node: HTMLElement | Document, context: Context) {
    for (const elem of selectAll('kerad[s]', node)) {
        const stateId = elem.getAttribute('s')!;
        const text = document.createTextNode(elem.textContent || '');
        elem.replaceWith(text);
        context.onMount(() => setBinding(stateId, text, 'data'));
    }
    for (const elem of selectAll('[kerad-p]', node)) {
        const attribs = elem.getAttribute('kerad-p')!;
        for (const propPair of attribs.split(' ')) {
            const [prop, stateId] = propPair.split(':');
            context.onMount(() => setBinding(stateId, elem, prop));
        }
        elem.removeAttribute('kerad-p');
    }
}

function bindTrigger(node: HTMLElement | Document) {
    for (const elem of selectAll('[kerad-t]', node)) {
        const attribs = elem.getAttribute('kerad-t')!;
        for (const propPair of attribs.split(' ')) {
            const [eventName, handlerId] = propPair.split(':');
            elem.addEventListener(eventName, () => {
                if ('value' in elem) {
                    fetch(`${TRIGGER_ENDPOINT}?id=${handlerId}`, { method: 'post', body: String(elem.value) });
                } else {
                    fetch(`${TRIGGER_ENDPOINT}?id=${handlerId}`, { method: 'post' });
                }
            });
        }
        elem.removeAttribute('kerad-t');
    }
}

function bindForm(node: HTMLElement | Document) {
    for (const elem of selectAll('form[kerad-f]', node)) {
        const formId = elem.getAttribute('kerad-f');
        elem.addEventListener('submit', (ev: SubmitEvent) => {
            const form = ev.currentTarget as HTMLFormElement;
            const formData: any = new FormData(form);
            fetch(`${SUBMIT_ENDPOINT}?id=${formId}`, { method: 'post', body: formData });
            const afterSubmit = form.getAttribute('afterSubmit');
            for (const input of selectAll('[name]', form) as unknown as HTMLInputElement[]) {
                if (afterSubmit === 'reset' || input.getAttribute('afterSubmit') === 'reset') {
                    input.value = input.getAttribute('resetValue') || '';
                }
            }
            ev.preventDefault();
        });
        elem.removeAttribute('kerad-f');
    }
}

function buttonifyButtons(node: HTMLElement | Document) {
    for (const button of selectAll('button:not([type])', node)) {
        button.setAttribute('type', 'button');
    }
}

export function bindRecursive(node: HTMLElement | Document, context: Context = new Context()) {
    let listElement;
    while ((listElement = select('kerad[l]', node))) {
        const listId = listElement.getAttribute('l')!;
        const listBegin = text();
        const listEnd = text();
        const listItems = new Map<string, ElementBorderData>();
        listBindings.set(listId, { begin: listBegin, end: listEnd, items: listItems, context });
        const contents: any[] = [listBegin];
        for (const item of listElement.children as unknown as HTMLElement[]) {
            const itemId = item.getAttribute('i')!;
            const itemContext = new Context();
            const itemBegin = text();
            const itemEnd = text();
            listItems.set(itemId, { begin: itemBegin, end: itemEnd, context: itemContext });
            context.onDismount(() => itemContext.dismount());
            contents.push(itemBegin);
            bindRecursive(item, itemContext);
            contents.push(...(item.childNodes as any), itemEnd);
        }
        contents.push(listEnd);
        for (const content of contents) {
            listElement.parentNode?.insertBefore(content, listElement);
        }
        listElement.remove();
    }
    bindClientComponent(node, context);
    bindState(node, context);
    bindTrigger(node);
    bindForm(node);
    buttonifyButtons(node);
}

export function updateState(stateId: string, value: string) {
    const bindings = stateBindings.get(stateId);
    for (const { elem, prop } of bindings || []) {
        setProperty(elem, prop, value);
    }
}

export function destroyListItem(listId: string, itemId: string) {
    const list = listBindings.get(listId);
    if (!list) {
        throw new Error(`failed to delete list item, missing list`);
    }
    const item = list.items.get(itemId);
    if (!item) {
        throw new Error(`failed to delete list item, missing item`);
    }
    destroyElements(item.begin, item.end);
    item.context.dismount();
    list.items.delete(itemId);
}

export function insertListItem(html: string, listId: string, itemId: string, nextId?: string) {
    const list = listBindings.get(listId);
    if (!list) {
        throw new Error(`failed to insert list item, missing list`);
    }
    let targetBefore;
    if (nextId) {
        const nextElem = list.items.get(nextId);
        if (!nextElem) {
            throw new Error(`failed to insert, missing item`);
        }
        targetBefore = nextElem.begin;
    } else {
        targetBefore = list.end;
    }
    const holder = document.createElement('div');
    holder.innerHTML = html;
    const itemBegin = text();
    const itemEnd = text();
    const itemContext = new Context();
    list.items.set(itemId, { begin: itemBegin, end: itemEnd, context: itemContext });
    list.context.onDismount(() => itemContext.dismount());
    bindRecursive(holder, itemContext);
    targetBefore.parentNode?.insertBefore(itemBegin, targetBefore);
    while (holder.firstChild) {
        targetBefore.parentNode?.insertBefore(holder.firstChild, targetBefore);
    }
    targetBefore.parentNode?.insertBefore(itemEnd, targetBefore);
}

export function replaceListItem(html: string, listId: string, itemId: string, replaceId: string) {
    insertListItem(html, listId, itemId, replaceId);
    destroyListItem(listId, replaceId);
}

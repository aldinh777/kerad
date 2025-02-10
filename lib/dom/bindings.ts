import type { Component } from '@aldinh777/kerad/jsx';
import { Context } from '@aldinh777/kerad/common';
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
const styleBindings = new Map<string, BindData[]>();
const classListElements = new Map<string, HTMLElement[]>();
const elementBindings = new Map<string, ElementBorderData[]>();
const listBindings = new Map<string, ListElementData[]>();

function removeFromArray<T>(arr: T[], item: T) {
    const index = arr.indexOf(item);
    if (index > -1) {
        arr.splice(index, 1);
    }
}

function setStateBinding(stateId: string, elem: any, prop: string) {
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

function setStyleBinding(stateId: string, elem: any, prop: string) {
    if (!styleBindings.has(stateId)) {
        styleBindings.set(stateId, []);
    }
    const bindings = styleBindings.get(stateId)!;
    const item = { elem, prop };
    bindings.push(item);
    return () => {
        removeFromArray(bindings, item);
        if (!bindings.length) {
            styleBindings.delete(stateId);
        }
    };
}

function setClassListBinding(classListId: string, elem: HTMLElement) {
    if (!classListElements.has(classListId)) {
        classListElements.set(classListId, []);
    }
    const list = classListElements.get(classListId)!;
    list.push(elem);
    return () => {
        removeFromArray(list, elem);
        if (!list.length) {
            classListElements.delete(classListId);
        }
    };
}

function setElementBinding(elemId: string, begin: Text, end: Text, context: Context) {
    if (!elementBindings.has(elemId)) {
        elementBindings.set(elemId, []);
    }
    const bindings = elementBindings.get(elemId)!;
    const item = { begin, end, context };
    bindings.push(item);
    return () => {
        removeFromArray(bindings, item);
        if (!bindings.length) {
            elementBindings.delete(elemId);
        }
    };
}

function setListBinding(
    listId: string,
    begin: Text,
    end: Text,
    items: Map<string, ElementBorderData>,
    context: Context
) {
    if (!listBindings.has(listId)) {
        listBindings.set(listId, []);
    }
    const list = listBindings.get(listId)!;
    const item = { begin, end, items, context };
    list.push(item);
    return () => {
        removeFromArray(list, item);
        if (!list.length) {
            listBindings.delete(listId);
        }
    };
}

function bindClientComponent(node: HTMLElement | Document, context: Context) {
    for (const elem of selectAll('clientside[src]', node)) {
        let src = elem.getAttribute('src');
        if (!src) {
            continue;
        }
        import('/app' + src.replace(/\.client\.tsx$/, '.client.js')).then(async (Comp: { default: Component }) => {
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
        context.onMount(() => setStateBinding(stateId, text, 'data'));
    }
    for (const elem of selectAll('[kerad-p]', node)) {
        const attribs = elem.getAttribute('kerad-p')!;
        for (const propPair of attribs.split(' ')) {
            const [prop, stateId] = propPair.split(':');
            context.onMount(() => setStateBinding(stateId, elem, prop));
        }
        elem.removeAttribute('kerad-p');
    }
    for (const elem of selectAll('[kerad-x]', node)) {
        const styles = elem.getAttribute('kerad-x')!;
        for (const stylePair of styles.split(' ')) {
            const [style, stateId] = stylePair.split(':');
            context.onMount(() => setStyleBinding(stateId, elem, style));
        }
        elem.removeAttribute('kerad-x');
    }
    for (const elem of selectAll('[kerad-cl]', node)) {
        const classListId = elem.getAttribute('kerad-cl')!;
        context.onMount(() => setClassListBinding(classListId, elem));
        elem.removeAttribute('kerad-cl');
    }
    let stateElement;
    while ((stateElement = select('kerad[e]', node))) {
        const elemId = stateElement.getAttribute('e')!;
        const elemContext = new Context();
        const elemBegin = text('');
        const elemEnd = text('');
        setElementBinding(elemId, elemBegin, elemEnd, elemContext);
        context.onDismount(() => elemContext.dismount());
        bindRecursive(stateElement, elemContext);
        const contents = [elemBegin, ...(stateElement.childNodes as any), elemEnd];
        for (const content of contents) {
            stateElement.parentNode?.insertBefore(content, stateElement);
        }
        stateElement.remove();
    }
}

function bindListItem(node: HTMLElement | Document, context: Context) {
    let listElement;
    while ((listElement = select('kerad[l]', node))) {
        const listId = listElement.getAttribute('l')!;
        const listBegin = text();
        const listEnd = text();
        const listItems = new Map<string, ElementBorderData>();
        context.onMount(() => setListBinding(listId, listBegin, listEnd, listItems, context));
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
            const aftersubmit = form.getAttribute('aftersubmit');
            for (const input of selectAll<HTMLInputElement>('[name]', form)) {
                if (aftersubmit === 'reset' || input.getAttribute('aftersubmit') === 'reset') {
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
    bindListItem(node, context);
    bindClientComponent(node, context);
    bindState(node, context);
    bindTrigger(node);
    bindForm(node);
    buttonifyButtons(node);
}

export function updateState(stateId: string, value: string) {
    const props = stateBindings.get(stateId);
    for (const { elem, prop } of props || []) {
        setProperty(elem, prop, value);
    }
    const styles = styleBindings.get(stateId);
    for (const { elem, prop } of styles || []) {
        (elem.style as any)[prop] = value;
    }
}

export function updateClassList(classListId: string, oldName: string, newName: string) {
    const elems = classListElements.get(classListId);
    for (const elem of elems || []) {
        if (!newName) {
            elem.classList.remove(oldName);
        } else if (!oldName) {
            elem.classList.add(newName);
        } else {
            elem.classList.replace(oldName, newName);
        }
    }
}

export function updateElement(elemId: string, html: string) {
    for (const { begin, end, context } of elementBindings.get(elemId) || []) {
        destroyElements(begin, end, true);
        const holder = document.createElement('div');
        holder.innerHTML = html;
        bindRecursive(holder, context);
        while (holder.firstChild) {
            end.parentNode?.insertBefore(holder.firstChild, end);
        }
    }
}

export function destroyListItem(listId: string, itemId: string) {
    for (const { items } of listBindings.get(listId) || []) {
        const item = items.get(itemId);
        if (!item) {
            throw new Error(`failed to delete, item missing`);
        }
        destroyElements(item.begin, item.end);
        item.context.dismount();
        items.delete(itemId);
    }
}

export function insertListItem(html: string, listId: string, itemId: string, nextId?: string) {
    for (const { items, end, context } of listBindings.get(listId) || []) {
        let targetBefore;
        if (nextId) {
            const nextElem = items.get(nextId);
            if (!nextElem) {
                throw new Error(`failed to insert, item missing`);
            }
            targetBefore = nextElem.begin;
        } else {
            targetBefore = end;
        }
        const holder = document.createElement('div');
        holder.innerHTML = html;
        const itemBegin = text();
        const itemEnd = text();
        const itemContext = new Context();
        items.set(itemId, { begin: itemBegin, end: itemEnd, context: itemContext });
        context.onDismount(() => itemContext.dismount());
        bindRecursive(holder, itemContext);
        targetBefore.parentNode?.insertBefore(itemBegin, targetBefore);
        while (holder.firstChild) {
            targetBefore.parentNode?.insertBefore(holder.firstChild, targetBefore);
        }
        targetBefore.parentNode?.insertBefore(itemEnd, targetBefore);
    }
}

export function replaceListItem(html: string, listId: string, itemId: string, replaceId: string) {
    insertListItem(html, listId, itemId, replaceId);
    destroyListItem(listId, replaceId);
}

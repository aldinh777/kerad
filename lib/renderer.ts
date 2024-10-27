import type { ServerContext } from '@aldinh777/kerad-core';
import type { Node, Props } from '@aldinh777/kerad-jsx';
import type { State } from '@aldinh777/reactive';
import {
    getListItem,
    registerFormHandler,
    registerList,
    registerPartial,
    registerState,
    registerTriggerHandler,
    setRegistryHandler,
    unregisterPartial
} from '@aldinh777/kerad-core';
import { pushListDelete, pushListInsert, pushListInsertLast, pushListUpdate, pushStateChange } from './ws.ts';

setRegistryHandler({
    state(state, stateId, connectionMap) {
        return state.onChange((value) => pushStateChange(connectionMap.keys(), JSON.stringify(value), stateId), true);
    },
    list(mappedList, listId, connectionMap) {
        const unsubWatch = mappedList.watch({
            async update(_index, { item, context }, prev) {
                const rendered = await renderToHtml(item, context);
                const partialId = `${listId}-${context.id}`;
                registerPartial(partialId, rendered, new Set(connectionMap.keys()));
                context.onDismount(() => unregisterPartial(partialId));
                pushListUpdate(connectionMap.keys(), listId, context.id, prev.context.id);
            },
            async insert(index, { item, context }) {
                const rendered = await renderToHtml(item, context);
                const isLast = index >= mappedList().length - 1;
                const next = mappedList(index + 1);
                const partialId = `${listId}-${context.id}`;
                registerPartial(partialId, rendered, new Set(connectionMap.keys()));
                context.onDismount(() => unregisterPartial(partialId));
                if (isLast) {
                    pushListInsertLast(connectionMap.keys(), listId, context.id);
                } else {
                    pushListInsert(connectionMap.keys(), listId, context.id, next.context.id);
                }
            },
            delete(_index, { context }) {
                pushListDelete(connectionMap.keys(), listId, context.id);
                context.dismount();
            }
        });
        return () => {
            unsubWatch();
            for (const { context } of mappedList()) {
                context.dismount();
            }
        };
    }
});

function isReactive(state: any): state is State {
    return typeof state === 'function' && 'onChange' in state;
}

function renderProps(props: Props, context: ServerContext) {
    const reactiveProps: [prop: string, stateId: string][] = [];
    const eventsProps: [event: string, handlerId: string][] = [];
    let strProps = '';
    for (const prop in props) {
        const value = props[prop];
        if (prop === 'children') {
            continue;
        } else if (prop.startsWith('on:')) {
            const eventName = prop.slice(3);
            eventsProps.push([eventName, registerTriggerHandler(value, context)]);
        } else if (isReactive(value)) {
            reactiveProps.push([prop, registerState(value, context)]);
            const val = value();
            if (val !== false) {
                strProps += ` ${prop}="${val}"`;
            }
        } else {
            if (value !== false) {
                strProps += ` ${prop}="${value}"`;
            }
        }
    }
    if (reactiveProps.length) {
        strProps += ` kerad-p="${reactiveProps.map((p) => p.join(':')).join(' ')}"`;
    }
    if (eventsProps.length) {
        strProps += ` kerad-t="${eventsProps.map((t) => t.join(':')).join(' ')}"`;
    }
    return strProps;
}

async function renderToHtml(item: Node | Node[], context: ServerContext): Promise<string> {
    if (item instanceof Array) {
        const htmlArray = await Promise.all(item.map((nested) => renderToHtml(nested, context)));
        return htmlArray.join('');
    } else if (typeof item === 'string') {
        return item;
    } else if (typeof item === 'function') {
        if ('onChange' in item) {
            return `<kerad s="${registerState(item, context)}">${item()}</kerad>`;
        } else if ('onUpdate' in item && 'onInsert' in item && 'onDelete' in item) {
            const listId = registerList(item, context);
            const childrenOutput = await Promise.all(
                item().map(async (value, index) => {
                    const listItem = getListItem(item, index);
                    const content = await renderToHtml(value, listItem.context);
                    return `<kerad i="${listItem.context.id}">${content}</kerad>`;
                })
            );
            return `<kerad l="${listId}">${childrenOutput.join('')}</kerad>`;
        }
    } else if (typeof item === 'object' && 'tag' in item && 'props' in item) {
        const { tag, props } = item;
        if (typeof tag === 'string') {
            if (tag === 'form' && typeof props['on:submit'] === 'function') {
                const submitHandler = props['on:submit'];
                const formId = registerFormHandler(submitHandler, context);
                props['kerad-f'] = formId;
                delete props['on:submit'];
            }
            if (props.children !== undefined) {
                const htmlOutput = await renderToHtml(props.children, context);
                return `<${tag}${renderProps(props, context)}>${htmlOutput}</${tag}>`;
            } else {
                return `<${tag}${renderProps(props, context)}></${tag}>`;
            }
        } else {
            return await renderToHtml(await tag(props, context), context);
        }
    }
    return String(item);
}

export async function renderPage(layout: string, component: any, context: ServerContext): Promise<string> {
    const result = await component.default({}, context);
    const html = await renderToHtml(result, context);
    const cid = context.connection.get('_cid');
    return layout
        .replace('%TITLE%', component.metadata?.title || process.env['APP_TITLE'] || '')
        .replace('%CID%', cid)
        .replace('%PAGE%', html);
}

import type { ServerContext } from '@aldinh777/kerad';
import type { Node, Props } from '@aldinh777/kerad/jsx';
import type { State } from '@aldinh777/reactive';
import {
    ClassList,
    getListItem,
    getSubContext,
    registerFormHandler,
    registerList,
    registerPartial,
    registerState,
    registerTriggerHandler,
    registerClassList,
    setRegistryHandler,
    unregisterPartial
} from '@aldinh777/kerad';
import {
    pushClassListUpdate,
    pushElementChange,
    pushListDelete,
    pushListInsert,
    pushListInsertLast,
    pushListUpdate,
    pushStateChange
} from './ws.ts';

setRegistryHandler({
    state(state, stateId, connectionMap, subContext) {
        return state.onChange((value) => {
            if (subContext) {
                subContext.dismount();
                registerPartial(stateId, renderToHtml(value, subContext), new Set(connectionMap.keys()));
                pushElementChange(connectionMap.keys(), stateId);
            } else {
                pushStateChange(connectionMap.keys(), JSON.stringify(value), stateId);
            }
        }, true);
    },
    list(mappedList, listId, connectionMap) {
        const unsubWatch = mappedList.watch({
            update(_index, { item, context }, prev) {
                const rendered = renderToHtml(item, context);
                const partialId = `${listId}-${context.id}`;
                registerPartial(partialId, rendered, new Set(connectionMap.keys()));
                context.onDismount(() => unregisterPartial(partialId));
                pushListUpdate(connectionMap.keys(), listId, context.id, prev.context.id);
            },
            insert(index, { item, context }) {
                const rendered = renderToHtml(item, context);
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
    },
    classList(classList, classListId, connections) {
        return classList.onUpdate((newName, oldName) => {
            pushClassListUpdate(connections.keys(), classListId, newName, oldName);
        });
    }
});

function isReactive(state: any): state is State {
    return typeof state === 'function' && 'onChange' in state;
}

function escapeHtml(html: any) {
    return String(html)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function renderProps(props: Props, context: ServerContext) {
    const reactiveProps: [prop: string, stateId: string][] = [];
    const eventsProps: [event: string, handlerId: string][] = [];
    const reactiveStylesProps: [style: string, stateId: string][] = [];
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
                strProps += ` ${prop}="${escapeHtml(val)}"`;
            }
        } else if (prop === 'style' && typeof value === 'object') {
            const styles: string[] = [];
            for (const key in value) {
                const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                const val = value[key];
                if (isReactive(val)) {
                    reactiveStylesProps.push([kebabKey, registerState(val, context)]);
                    styles.push(`${kebabKey}:${val()}`);
                } else {
                    styles.push(`${kebabKey}:${val}`);
                }
            }
            strProps += ` style="${styles.join(';')}"`;
        } else if (prop === 'class' && value instanceof ClassList) {
            strProps += ` kerad-cl="${registerClassList(value, context)}" class="${value.toString()}"`;
        } else {
            if (value !== false) {
                strProps += ` ${prop}="${escapeHtml(value)}"`;
            }
        }
    }
    if (reactiveProps.length) {
        strProps += ` kerad-p="${reactiveProps.map((p) => p.join(':')).join(' ')}"`;
    }
    if (eventsProps.length) {
        strProps += ` kerad-t="${eventsProps.map((t) => t.join(':')).join(' ')}"`;
    }
    if (reactiveStylesProps.length) {
        strProps += ` kerad-x="${reactiveStylesProps.map((s) => s.join(':')).join(' ')}"`;
    }
    return strProps;
}

async function renderToHtml(item: Node | Node[], context: ServerContext): Promise<string> {
    if (item instanceof Array) {
        const htmlArray = await Promise.all(item.map((nested) => renderToHtml(nested, context)));
        return htmlArray.join('');
    } else if (typeof item === 'string') {
        return escapeHtml(item);
    } else if (typeof item === 'function') {
        if ('onChange' in item) {
            const stateId = registerState(item, context);
            const val = item();
            if (val instanceof Object) {
                const subContext = getSubContext(item)!;
                return `<kerad e="${stateId}">${await renderToHtml(val, subContext)}</kerad>`;
            } else {
                return `<kerad s="${stateId}">${escapeHtml(val)}</kerad>`;
            }
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
    return escapeHtml(item);
}

export async function renderPage(layout: string, component: any, context: ServerContext): Promise<string | Response> {
    const result = await component.default({}, context);
    if (result instanceof Response) {
        return result;
    }
    const html = await renderToHtml(result, context);
    context.res.headers['Content-Type'] = 'text/html';
    return layout
        .replace('%TITLE%', component.metadata?.title || process.env['APP_TITLE'] || '')
        .replace('%CID%', context.id)
        .replace('%PAGE%', html);
}

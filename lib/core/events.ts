import type { ServerContext, SubscriptionData } from './utils.ts';
import { createIdGenerator, handleContextData } from './utils.ts';

// Trigger Handler

const handlerMap = new Map<(value: string) => any, SubscriptionData>();
const triggerMap = new Map<string, (value: string) => any>();
const triggerIdGenerator = createIdGenerator();

export function registerTriggerHandler(handler: (value?: string) => any, context: ServerContext) {
    return handleContextData(context, handlerMap, handler, {
        onCreate() {
            const handlerId = triggerIdGenerator.next();
            triggerMap.set(handlerId, handler);
            return {
                id: handlerId,
                connectionMap: new Map()
            };
        },
        onEmpty(handlerId) {
            triggerMap.delete(handlerId);
            triggerIdGenerator.delete(handlerId);
        }
    });
}

export async function triggerHandler(handlerId: string, value: string) {
    if (!triggerMap.has(handlerId)) {
        return { result: 'not found' };
    }
    try {
        await triggerMap.get(handlerId)!(value);
        return { result: 'ok' };
    } catch (error) {
        return { result: 'error', error };
    }
}

// Form Submit Handler

const formHandlerMap = new Map<(formData: FormData) => any, SubscriptionData>();
const formSubmitMap = new Map<string, (formData: FormData) => any>();
const formIdGenerator = createIdGenerator();

export function registerFormHandler(formHandler: (formData: FormData) => any, context: ServerContext) {
    return handleContextData(context, formHandlerMap, formHandler, {
        onCreate() {
            const formId = formIdGenerator.next();
            formSubmitMap.set(formId, formHandler);
            return {
                id: formId,
                connectionMap: new Map()
            };
        },
        onEmpty(formId) {
            formSubmitMap.delete(formId);
            formIdGenerator.delete(formId);
        }
    });
}

export async function submitForm(formId: string, formData: FormData) {
    if (!formSubmitMap.has(formId)) {
        return { result: 'not found' };
    }
    try {
        await formSubmitMap.get(formId)!(formData);
        return { result: 'ok' };
    } catch (error) {
        return { result: 'error', error };
    }
}

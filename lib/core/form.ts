import type { ServerContext, SubscriptionData } from './utils.ts';
import { createIdGenerator, handleContextData } from './utils.ts';

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

export function submitForm(formId: string, formData: FormData) {
    if (!formSubmitMap.has(formId)) {
        return { result: 'not found' };
    }
    try {
        formSubmitMap.get(formId)!(formData);
        return { result: 'ok' };
    } catch (error) {
        return { result: 'error', error };
    }
}

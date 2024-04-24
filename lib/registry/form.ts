import type { ServerContext } from '@aldinh777/rekt-jsx/jsx-runtime'
import type { SubscriptionData } from './utils'
import { createIdGenerator, handleContextData } from './utils'

const formHandlerMap = new Map<(formData: FormData) => any, SubscriptionData>()
const formSubmitMap = new Map<string, (formData: FormData) => any>()
const formIdGenerator = createIdGenerator()

export function registerFormHandler(formHandler: (formData: FormData) => any, context: ServerContext) {
    return handleContextData(context, formHandlerMap, formHandler, {
        onCreate() {
            const formId = formIdGenerator.next()
            formSubmitMap.set(formId, formHandler)
            return {
                id: formId,
                connectionMap: new Map()
            }
        },
        onEmpty(formId) {
            formSubmitMap.delete(formId)
            formIdGenerator.delete(formId)
        }
    })
}

export function submitForm(formId: string, formData: FormData) {
    if (!formSubmitMap.has(formId)) {
        return { result: 'not found' }
    }
    try {
        formSubmitMap.get(formId)!(formData)
        return { result: 'ok' }
    } catch (error) {
        return { result: 'error', error }
    }
}

import type { State } from '@aldinh777/reactive'
import type { Unsubscribe } from '@aldinh777/reactive/utils/subscription'
import type { RektNode, ServerContext } from '@aldinh777/rekt-jsx/jsx-runtime'
import type { ObservedList, WatchableList } from '@aldinh777/reactive/list/watchable'
import { randomString } from '@aldinh777/toolbox/random'
import { map } from '@aldinh777/reactive/list/utils'
import { createContext } from '@aldinh777/rekt-jsx/jsx-runtime'

interface UniqueHandlers {
    state?: (state: State, stateId: string, connections: Map<string, Set<string>>) => Unsubscribe
    list?: (mappedList: ObservedList<StoredItem>, listId: string, connections: Map<string, Set<string>>) => Unsubscribe
}
interface SubscriptionData {
    id: string
    connectionMap: Map<string, Set<string>>
    unsubscribe?: Unsubscribe
}
interface ListSubscriptionData extends SubscriptionData {
    mappedList: ObservedList<StoredItem>
}
interface StoredItem {
    item: RektNode | RektNode[]
    context: ServerContext
}
interface PartialData {
    content: string
    connectionSet: Set<string>
}
interface IdGenerator {
    next(): string
    delete(id: string): void
}
interface ContextDataHandler {
    onCreate(): SubscriptionData
    onEmpty(id: string): any
}

function createIdGenerator(): IdGenerator {
    const set = new Set<string>()
    return {
        next() {
            let id = randomString(3)
            while (set.has(id)) {
                id += randomString()
            }
            set.add(id)
            return id
        },
        delete(id: string) {
            set.delete(id)
        }
    }
}

// Handler for state and list
const uniqueHandlers: UniqueHandlers = {}
// Connection Data
const contextConnectionMap = new Map<string, ServerContext>()
// State Hash
const stateMap = new Map<State, SubscriptionData>()
// List & Item Hash
const listMap = new Map<WatchableList<any>, ListSubscriptionData>()
// Trigger & Handler Hash
const handlerMap = new Map<(value: string) => any, SubscriptionData>()
const triggerMap = new Map<string, (value: string) => any>()
// Form Handler Hash
const formHandlerMap = new Map<(formData: FormData) => any, SubscriptionData>()
const formSubmitMap = new Map<string, (formData: FormData) => any>()
// Partial Map
const partialMap = new Map<string, PartialData>()
// Id Generators
const connectionIdGenerator = createIdGenerator()
const stateIdGenerator = createIdGenerator()
const listIdGenerator = createIdGenerator()
const triggerIdGenerator = createIdGenerator()
const formIdGenerator = createIdGenerator()

function createSubContext(parentContext: ServerContext, itemIdGenerator: IdGenerator) {
    const contextId = itemIdGenerator.next()
    const context: ServerContext = {
        id: contextId,
        connectionId: parentContext.connectionId,
        request: parentContext.request,
        data: parentContext.data,
        setHeader(name: string, value: string): void {
            parentContext.setHeader(name, value)
        },
        setStatus(code: number, statusText?: string | undefined): void {
            parentContext.setStatus(code, statusText)
        },
        ...createContext()
    }
    context.onDismount(() => itemIdGenerator.delete(contextId))
    parentContext.onDismount(() => context.dismount())
    return context
}

function createServerContext(req: Request, data: any) {
    const contextId = connectionIdGenerator.next()
    const context: ServerContext = {
        id: contextId,
        connectionId: contextId,
        request: req,
        data: data,
        setHeader: function (name: string, value: string): void {
            data.response ??= {}
            data.response.headers ??= {}
            data.response.headers[name] = value
        },
        setStatus: function (status: number, statusText: string): void {
            data.response ??= {}
            data.response.status ??= status
            data.response.status ??= statusText
        },
        ...createContext()
    }
    contextConnectionMap.set(contextId, context)
    return context
}

function handleContextData<T>(
    context: ServerContext,
    map: Map<T, SubscriptionData>,
    item: T,
    handlers: ContextDataHandler
) {
    if (!map.has(item)) {
        map.set(item, handlers.onCreate())
    }
    const { id, connectionMap, unsubscribe } = map.get(item)!
    if (!connectionMap.has(context.connectionId)) {
        connectionMap.set(context.connectionId, new Set())
    }
    const contextSet = connectionMap.get(context.connectionId)!
    if (!contextSet.has(context.id)) {
        contextSet.add(context.id)
        context.onDismount(() => {
            contextSet.delete(context.id)
            if (contextSet.size === 0) {
                connectionMap.delete(context.connectionId)
                if (connectionMap.size === 0) {
                    map.delete(item)
                    handlers.onEmpty(id)
                    unsubscribe?.()
                }
            }
        })
    }
    return id
}

function registerState(state: State, context: ServerContext) {
    return handleContextData(context, stateMap, state, {
        onCreate() {
            const stateId = stateIdGenerator.next()
            const connectionMap = new Map<string, Set<string>>()
            return {
                id: stateId,
                connectionMap: connectionMap,
                unsubscribe: uniqueHandlers.state?.(state, stateId, connectionMap)
            }
        },
        onEmpty(stateId) {
            stateIdGenerator.delete(stateId)
        }
    })
}

function registerList(list: WatchableList<any>, context: ServerContext) {
    return handleContextData(context, listMap, list, {
        onCreate() {
            const listId = listIdGenerator.next()
            const connectionMap = new Map<string, Set<string>>()
            const itemIdGenerator = createIdGenerator()
            const mappedList = map(list, (item) => ({
                item: item,
                context: createSubContext(context, itemIdGenerator)
            }))
            return {
                id: listId,
                connectionMap: connectionMap,
                unsubscribe: uniqueHandlers.list?.(mappedList, listId, connectionMap),
                mappedList: mappedList
            }
        },
        onEmpty(listId) {
            listIdGenerator.delete(listId)
        }
    })
}

function registerTriggerHandler(handler: (value?: string) => any, context: ServerContext) {
    return handleContextData(context, handlerMap, handler, {
        onCreate() {
            const handlerId = triggerIdGenerator.next()
            triggerMap.set(handlerId, handler)
            return {
                id: handlerId,
                connectionMap: new Map()
            }
        },
        onEmpty(handlerId) {
            triggerMap.delete(handlerId)
            triggerIdGenerator.delete(handlerId)
        }
    })
}

function registerFormHandler(formHandler: (formData: FormData) => any, context: ServerContext) {
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

function registerPartial(partialId: string, output: string, connectionSet: Set<string>) {
    partialMap.set(partialId, { content: output, connectionSet })
}

function unregisterPartial(partialId: string) {
    partialMap.delete(partialId)
}

function unsubscribe(connectionId: string) {
    if (contextConnectionMap.has(connectionId)) {
        const context = contextConnectionMap.get(connectionId)!
        contextConnectionMap.delete(connectionId)
        connectionIdGenerator.delete(connectionId)
        context.dismount()
    }
}

function getListItem(list: WatchableList<any>, index: number) {
    return listMap.get(list)!.mappedList(index)
}

function triggerHandler(handlerId: string, value: string) {
    if (!triggerMap.has(handlerId)) {
        return 'not found'
    }
    try {
        triggerMap.get(handlerId)!(value)
        return 'ok'
    } catch (error) {
        return error
    }
}

function submitForm(formId: string, formData: FormData) {
    if (!formSubmitMap.has(formId)) {
        return 'not found'
    }
    try {
        formSubmitMap.get(formId)!(formData)
        return 'ok'
    } catch (error) {
        return error
    }
}

function renderPartial(partialId: string, connectionId: string | null) {
    if (!partialMap.has(partialId)) {
        return { result: 'not found' }
    }
    const { connectionSet, content } = partialMap.get(partialId)!
    if (connectionId && connectionSet.has(connectionId)) {
        return { result: 'ok', content }
    } else {
        return { result: 'unauthorized' }
    }
}

export const hasher = {
    setHandler(handler: UniqueHandlers) {
        uniqueHandlers.state = handler.state
        uniqueHandlers.list = handler.list
    },
    createServerContext: createServerContext,
    registerState: registerState,
    registerList: registerList,
    registerHandler: registerTriggerHandler,
    registerFormHandler: registerFormHandler,
    registerPartial: registerPartial,
    unregisterPartial: unregisterPartial,
    unsubscribe: unsubscribe,
    getListItem: getListItem,
    triggerHandler: triggerHandler,
    submitForm: submitForm,
    renderPartial: renderPartial
}

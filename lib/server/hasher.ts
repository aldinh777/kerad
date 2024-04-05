import type { State } from '@aldinh777/reactive'
import type { Unsubscribe } from '@aldinh777/reactive/utils/subscription'
import type { RektNode, ServerContext } from '../common/jsx-runtime'
import type { ObservedList, WatchableList } from '@aldinh777/reactive/collection/list'
import { randomString } from '@aldinh777/toolbox/random'
import { maplist } from '@aldinh777/reactive/collection/list/map'
import { createContext } from '../common/jsx-runtime'

interface UniqueHandlers {
    state: (state: State, stateId: string, connectionMap: Map<string, Set<string>>) => Unsubscribe
    list: (mappedList: ObservedList<StoredItem>, listId: string, connectionMap: Map<string, Set<string>>) => Unsubscribe
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
interface IdGenerator {
    next(): string
    delete(id: string): void
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

export function createHasher(uniqueHandlers: UniqueHandlers) {
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
    // Id Generators
    const connectionIdGenerator = createIdGenerator()
    const stateIdGenerator = createIdGenerator()
    const listIdGenerator = createIdGenerator()
    const triggerIdGenerator = createIdGenerator()
    const formIdGenerator = createIdGenerator()

    function generateSubContext(parentContext: ServerContext, itemIdGenerator: IdGenerator) {
        const contextId = itemIdGenerator.next()
        const context: ServerContext = {
            id: contextId,
            connectionId: parentContext.connectionId,
            request: parentContext.request,
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
    function generateContext(req: Request, resData: any) {
        const contextId = connectionIdGenerator.next()
        const context: ServerContext = {
            id: contextId,
            connectionId: contextId,
            request: req,
            setHeader: function (name: string, value: string): void {
                resData.headers ??= {}
                resData.headers[name] = value
            },
            setStatus: function (status: number, statusText: string): void {
                resData.status &&= status
                resData.status &&= statusText
            },
            ...createContext()
        }
        contextConnectionMap.set(contextId, context)
        return context
    }
    function registerState(state: State, context: ServerContext) {
        if (!stateMap.has(state)) {
            const stateId = stateIdGenerator.next()
            const connectionMap = new Map<string, Set<string>>()
            stateMap.set(state, {
                id: stateId,
                connectionMap: connectionMap,
                unsubscribe: uniqueHandlers.state(state, stateId, connectionMap)
            })
        }
        const { id: stateId, connectionMap, unsubscribe } = stateMap.get(state)!
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
                        stateMap.delete(state)
                        stateIdGenerator.delete(stateId)
                        unsubscribe?.()
                    }
                }
            })
        }
        return stateId
    }
    function registerList(list: WatchableList<any>, context: ServerContext) {
        if (!listMap.has(list)) {
            const listId = listIdGenerator.next()
            const connectionMap = new Map<string, Set<string>>()
            const itemIdGenerator = createIdGenerator()
            const mappedList = maplist(list, (item) => ({
                item: item,
                context: generateSubContext(context, itemIdGenerator)
            }))
            listMap.set(list, {
                id: listId,
                connectionMap: connectionMap,
                unsubscribe: uniqueHandlers.list(mappedList, listId, connectionMap),
                mappedList: mappedList
            })
        }
        const { id: listId, connectionMap, unsubscribe } = listMap.get(list)!
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
                        listMap.delete(list)
                        listIdGenerator.delete(listId)
                        unsubscribe?.()
                    }
                }
            })
        }
        return listId
    }
    function registerHandler(handler: (value?: string) => any, context: ServerContext) {
        if (!handlerMap.has(handler)) {
            const handlerId = triggerIdGenerator.next()
            handlerMap.set(handler, {
                id: handlerId,
                connectionMap: new Map()
            })
            triggerMap.set(handlerId, handler)
        }
        const { id: handlerId, connectionMap } = handlerMap.get(handler)!
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
                        handlerMap.delete(handler)
                        triggerMap.delete(handlerId)
                        triggerIdGenerator.delete(handlerId)
                    }
                }
            })
        }
        return handlerId
    }
    function registerFormHandler(handler: (formData: FormData) => any, context: ServerContext) {
        if (!formHandlerMap.has(handler)) {
            const formId = formIdGenerator.next()
            formHandlerMap.set(handler, {
                id: formId,
                connectionMap: new Map()
            })
            formSubmitMap.set(formId, handler)
        }
        const { id: formId, connectionMap } = formHandlerMap.get(handler)!
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
                        formHandlerMap.delete(handler)
                        formSubmitMap.delete(formId)
                        formIdGenerator.delete(formId)
                    }
                }
            })
        }
        return formId
    }
    function unsubscribe(connectionId: string) {
        if (contextConnectionMap.has(connectionId)) {
            const context = contextConnectionMap.get(connectionId)!
            contextConnectionMap.delete(connectionId)
            connectionIdGenerator.delete(connectionId)
            context.dismount()
        }
    }
    function getContext(list: WatchableList<any>, index: number) {
        return listMap.get(list)!.mappedList(index).context
    }
    function triggerHandler(handlerId: string, value: string) {
        if (triggerMap.has(handlerId)) {
            const handler = triggerMap.get(handlerId)
            try {
                handler!(value)
                return 'ok'
            } catch (error) {
                return error
            }
        } else {
            return 'not found'
        }
    }
    function submitForm(formId: string, formData: FormData) {
        if (formSubmitMap.has(formId)) {
            const handler = formSubmitMap.get(formId)
            try {
                handler!(formData)
                return 'ok'
            } catch (error) {
                return error
            }
        } else {
            return 'not found'
        }
    }

    return {
        generateContext,
        generateSubContext,
        registerState,
        registerList,
        registerHandler,
        registerFormHandler,
        unsubscribe,
        getContext,
        triggerHandler,
        submitForm
    }
}

export async function md5Hash(filename: string) {
    const hasher = new Bun.CryptoHasher('md5')
    const file = Bun.file(filename)
    hasher.update(await file.arrayBuffer())
    return hasher.digest('hex')
}

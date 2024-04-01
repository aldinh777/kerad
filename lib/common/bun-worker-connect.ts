import { randomString } from '@aldinh777/toolbox/random'

declare var self: Worker
type WorkerHandler<T = any> = (payload: T) => Promise<any>
type PayloadData = [id: string, type: 'fetch' | 'result', payload: any]

export const workerImporter = (baseUrl: string) => (script: string) => new Worker(new URL(script, baseUrl).href)
export const connectToMain = () => connectToWorker(self)
export const onConnectFromMain = <T>(handler: WorkerHandler<T>) => onConnectFromWorker(self, handler)

export function connectToWorker(worker: Worker) {
    const resolvers = new Map<string, (value: any) => any>()
    worker.addEventListener('message', (ev: MessageEvent<PayloadData>) => {
        const [id, type, payload] = ev.data
        if (type == 'result' && resolvers.has(id)) {
            const resolver = resolvers.get(id)
            resolvers.delete(id)
            resolver!(payload)
        }
    })
    return (payload: any) =>
        new Promise((resolve) => {
            const id = randomString(6)
            worker.postMessage([id, 'fetch', payload])
            resolvers.set(id, resolve)
        })
}

export function onConnectFromWorker<T>(worker: Worker, handler: WorkerHandler<T>) {
    worker.addEventListener('message', async (ev: MessageEvent<PayloadData>) => {
        const [id, type, payload] = ev.data
        if (type === 'fetch') {
            worker.postMessage([id, 'result', await handler(payload)])
        }
    })
}

import { connectToWorker, onConnectFromWorker, connectToMain, onConnectFromMain } from './bun-worker-connect'

interface WorkerData {
    name: string
    worker: Worker
    error?: (ev: ErrorEvent) => any
}

export function workerHub(workers: WorkerData[]) {
    const relays = new Map<string, (payload: any) => Promise<any>>()
    for (const { name, worker, error } of workers) {
        relays.set(name, connectToWorker(worker))
        worker.addEventListener('error', error || ((ev) => console.error(ev.message)))
        onConnectFromWorker<[string, string, any]>(worker, async ([target, method, payload]) => {
            const fetchWorker = relays.get(target)
            return fetchWorker?.([method, payload])
        })
    }
}

interface MethodObjects {
    [name: string]: (...payloads: any[]) => Promise<any>
}

export function connectToHub(methodsObj?: MethodObjects) {
    const fetchFromHub = connectToMain()
    const methods = new Map<string, (...payloads: any[]) => Promise<any>>()
    for (const name in methodsObj) {
        methods.set(name, methodsObj[name])
    }
    onConnectFromMain<[string, any]>(async ([method, payload]) => {
        const handler = methods.get(method)
        return handler?.(...payload)
    })
    return {
        fetch: (name: string, method: string, ...payload: any[]) => {
            return fetchFromHub([name, method, payload])
        }
    }
}

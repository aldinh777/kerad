import { connectToWorker, onConnectFromWorker, connectToMain, onConnectFromMain } from './bun-worker-connect'

export function workerHub(workers) {
    const relays = new Map()
    for (const { name, worker, error } of workers) {
        relays.set(name, connectToWorker(worker))
        worker.addEventListener('error', error || ((ev) => console.error(ev.message)))
        onConnectFromWorker(worker, ([target, method, payload]) => {
            const fetchWorker = relays.get(target)
            return fetchWorker?.([method, payload])
        })
    }
}

export function connectToHub(methodsObj) {
    const fetchFromHub = connectToMain()
    const methods = new Map()
    for (const name in methodsObj) {
        methods.set(name, methodsObj[name])
    }
    onConnectFromMain(([method, payload]) => {
        const handler = methods.get(method)
        return handler?.(...payload)
    })
    return {
        fetch: (name, method, ...payload) => {
            return fetchFromHub([name, method, payload])
        }
    }
}

import { randomString } from '@aldinh777/toolbox/random'

/**
 * @callback importer
 * @param {string} script
 * @returns {Worker}
 */

/**
 * Shortcut for creating new Worker
 *
 * @param {string} base
 * @returns {importer}
 */
export const workerImporter = (baseUrl) => (script) => new Worker(new URL(script, baseUrl).href)

/**
 * @callback connectHelper
 * @param {any} payload
 * @return {Promise}
 */

/**
 * Create a helper to post one time payload from Main to Worker
 *
 * @param {Worker} worker
 * @returns {connectHelper}
 */
export const connectToWorker = (worker) => {
    const resolvers = new Map()
    worker.addEventListener('message', (ev) => {
        const [id, type, payload] = ev.data
        if (type == 'result' && resolvers.has(id)) {
            const resolver = resolvers.get(id)
            resolvers.delete(id)
            resolver(payload)
        }
    })
    return (payload) =>
        new Promise((resolve) => {
            const id = randomString(6)
            worker.postMessage([id, 'fetch', payload])
            resolvers.set(id, resolve)
        })
}

/**
 * Create a helper to post one time payload from Worker to Main
 *
 * @returns {connectHelper}
 */
export const connectToMain = () => connectToWorker(self)

/**
 * Handle post of one time payload from Worker
 *
 * @param {Worker} worker
 * @param {Function} handler
 */
export const onConnectFromWorker = (worker, handler) => {
    worker.addEventListener('message', async (ev) => {
        const [id, type, payload] = ev.data
        if (type === 'fetch') {
            worker.postMessage([id, 'result', await handler(payload)])
        }
    })
}

/**
 * Handler post of one time payload from Main
 *
 * @param {Function} handler
 * @returns
 */
export const onConnectFromMain = (handler) => onConnectFromWorker(self, handler)

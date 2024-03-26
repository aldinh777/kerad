import { workerImporter } from './lib/bun-worker-connect'
import { workerHub } from './lib/bun-worker-hub'

const importWorker = workerImporter(import.meta.url)

const httpServer = importWorker('./server/http.js')
const wsServer = importWorker('./server/ws.js')
const renderer = importWorker('./server/renderer.js')

workerHub([
    { name: 'http', worker: httpServer },
    { name: 'ws', worker: wsServer },
    { name: 'renderer', worker: renderer }
])

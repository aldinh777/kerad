import { bindRecursive } from './lib/bindings'
import { subscribeServerEvents } from './lib/server-events'

bindRecursive(document)
subscribeServerEvents()

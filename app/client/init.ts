import { bindRecursive } from './lib/bindings.ts';
import { subscribeServerEvents } from './lib/server-events.ts';

bindRecursive(document);
subscribeServerEvents();

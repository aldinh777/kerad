import { bindRecursive } from './bindings.ts';
import { initSocket } from './socket.ts';

bindRecursive(document);
initSocket();

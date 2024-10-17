import { bindRecursive } from './lib/bindings.ts';
import { initSocket } from './lib/socket.ts';

bindRecursive(document);
initSocket();

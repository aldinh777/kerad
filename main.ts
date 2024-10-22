import server from './lib/server.ts';
import * as ws from './lib/ws.ts';

ws.startWebsocketServer();

import * as bundler from './lib/bundler';
import * as hr from './lib/hot-reload';

bundler.watchBundle();
hr.startHotReloadServer();

export default {
    port: server.port,
    fetch: server.fetch
};

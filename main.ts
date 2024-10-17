import * as http from './lib/http.ts';
import * as ws from './lib/ws.ts';

http.startHttpServer();
ws.startWebsocketServer();

import * as bundler from './lib/bundler';
import * as hr from './lib/hot-reload';

bundler.watchBundle();
hr.startHotReloadServer();

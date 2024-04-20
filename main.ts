import * as http from './lib/http'
import * as ws from './lib/ws'

http.startHttpServer()
ws.startWebsocketServer()

import * as bundler from './lib/bundler'
import * as hr from './lib/hot-reload'

bundler.watchBundle()
hr.startHotReloadServer()

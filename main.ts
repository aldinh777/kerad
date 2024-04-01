import { http } from './lib/server/http'
import { ws } from './lib/server/ws'
import './lib/server/bundler'
import './lib/server/hot-reload'

http.startServer()
ws.startServer()

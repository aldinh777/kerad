import { http } from './lib/http'
import { ws } from './lib/ws'
import './lib/bundler'
import './lib/hot-reload'

http.startServer()
ws.startServer()

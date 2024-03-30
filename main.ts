import { http } from './server/http'
import { ws } from './server/ws'
import './server/hot-reload'

http.startServer()
ws.startServer()

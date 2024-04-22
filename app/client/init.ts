import { createContext } from '@aldinh777/rekt-jsx/jsx-runtime'
import { bindRecursive } from './lib/bindings'
import { initSocket } from './lib/socket'

bindRecursive(document, createContext())
initSocket()

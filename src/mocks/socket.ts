import { ws } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'
import type { NftUpdate, OrderUpdate } from '../types'

// @mswjs/socket.io-binding@0.2.0 exports toSocketIo (not SocketIo).
// This handler speaks the Socket.IO protocol through the MSW WebSocket layer.
// Usa a mesma origem que o cliente Socket.IO. Isso evita mixed content
// ao publicar o site em HTTPS e elimina dependências de localhost:8788.
const socketOrigin = new URL(import.meta.env.VITE_SOCKET_URL || window.location.origin)
socketOrigin.protocol = socketOrigin.protocol === 'https:' || socketOrigin.protocol === 'wss:' ? 'wss:' : 'ws:'
socketOrigin.pathname = '/'
socketOrigin.search = ''
socketOrigin.hash = ''
const socket = ws.link(socketOrigin.toString())
type MockSocket = ReturnType<typeof toSocketIo>['client']
const listeners = new Set<MockSocket>()

export const socketHandler = socket.addEventListener('connection', (connection) => {
  const io = toSocketIo(connection)
  listeners.add(io.client)
  connection.client.addEventListener('close', () => listeners.delete(io.client))
})

function broadcast(name: string, data: NftUpdate | OrderUpdate) {
  for (const client of listeners) {
    try {
      client.emit(name, data)
    } catch {
      listeners.delete(client)
    }
  }
}

export function emitNft(data: NftUpdate) {
  broadcast('nft.updated', data)
}

export function emitOrder(data: OrderUpdate) {
  broadcast('order.updated', data)
}

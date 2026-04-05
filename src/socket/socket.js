import { io } from 'socket.io-client'

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000', {
  autoConnect: false,
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  auth: { token: localStorage.getItem('token') },
})

export function reconnectWithToken(token) {
  socket.auth = { token }
  if (socket.connected) socket.disconnect()
  socket.connect()
}

export default socket

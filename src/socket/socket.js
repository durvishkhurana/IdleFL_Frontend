import { io } from 'socket.io-client'

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000', {
  autoConnect: false,
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
})

export default socket
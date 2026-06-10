import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectSocket(token: string) {
  if (socket?.connected) return socket;

  socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/v1', '') ?? 'http://localhost:4000', {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => console.log('[Admin] Socket connected'));
  socket.on('disconnect', (reason) => console.warn('[Admin] Socket disconnected:', reason));
  socket.on('connect_error', (err) => console.error('[Admin] Socket error:', err.message));

  return socket;
}

export function getSocket(): Socket {
  if (!socket) throw new Error('Socket not initialized. Call connectSocket first.');
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

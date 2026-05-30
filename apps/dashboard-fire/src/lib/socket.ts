import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket;

  const url = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1').replace('/v1', '');

  socket = io(url, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => console.log('[Police Dashboard] Socket connected'));
  socket.on('disconnect', (reason) => console.warn('[Police Dashboard] Socket disconnected:', reason));
  socket.on('connect_error', (err) => console.error('[Police Dashboard] Socket error:', err.message));

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

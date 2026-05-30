import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

let socket: Socket | null = null;

export function connectSocket(): Socket {
  const token = useAuthStore.getState().accessToken;
  const baseUrl = (process.env as any).EXPO_PUBLIC_API_URL?.replace('/v1', '') ?? 'http://localhost:4000';

  socket = io(baseUrl, {
    auth: { token },
    transports: ['websocket'],
  });

  socket.on('connect', () => console.log('[Socket] connected'));
  socket.on('disconnect', (reason) => console.log('[Socket] disconnected:', reason));

  return socket;
}

export function getSocket(): Socket {
  if (!socket) connectSocket();
  return socket!;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function joinIncidentRoom(incidentId: string) {
  getSocket().emit('join:incident', incidentId);
}

export function leaveIncidentRoom(incidentId: string) {
  getSocket().emit('leave:incident', incidentId);
}

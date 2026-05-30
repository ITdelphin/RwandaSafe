'use client';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/v1', '') ?? 'http://localhost:4000';
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    socket = io(baseUrl, { auth: { token }, transports: ['websocket'] });
  }
  return socket;
}

export function joinIncidentRoom(id: string) { getSocket().emit('join:incident', id); }
export function leaveIncidentRoom(id: string) { getSocket().emit('leave:incident', id); }

'use client';
import { create } from 'zustand';
import { connectSocket, disconnectSocket } from '../lib/socket';

interface Officer {
  id: string;
  phone: string;
  name?: string;
  role: string;
}

interface AuthState {
  user: Officer | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: Officer, token: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('police_access_token', token);
      localStorage.setItem('police_user', JSON.stringify(user));
    }
    connectSocket(token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('police_access_token');
      localStorage.removeItem('police_user');
    }
    disconnectSocket();
    set({ user: null, token: null, isAuthenticated: false });
  },

  hydrate: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('police_access_token');
    const userStr = localStorage.getItem('police_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        connectSocket(token);
        set({ user, token, isAuthenticated: true });
      } catch {}
    }
  },
}));

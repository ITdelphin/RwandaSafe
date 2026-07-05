'use client';
import { create } from 'zustand';

interface Admin {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  role: string;
}

interface AuthState {
  user: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: Admin, token: string, remember?: boolean) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (user, token, remember = true) => {
    if (typeof window !== 'undefined') {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('admin_access_token', token);
      storage.setItem('admin_user', JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true });
  },

  setTokens: (accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_access_token', accessToken);
      if (refreshToken) localStorage.setItem('admin_refresh_token', refreshToken);
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_user');
      sessionStorage.removeItem('admin_access_token');
      sessionStorage.removeItem('admin_user');
    }
    set({ user: null, token: null, isAuthenticated: false });
  },

  hydrate: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('admin_access_token') || sessionStorage.getItem('admin_access_token');
    const userStr = localStorage.getItem('admin_user') || sessionStorage.getItem('admin_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true });
      } catch {}
    }
  },
}));

'use client';
import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  selectedIncidentId: string | null;
  drawerOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  openDrawer: (incidentId: string) => void;
  closeDrawer: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  selectedIncidentId: null,
  drawerOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openDrawer: (incidentId) => set({ selectedIncidentId: incidentId, drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false, selectedIncidentId: null }),
}));

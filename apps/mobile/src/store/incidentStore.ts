import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DraftIncident {
  type?: string;
  severity: string;
  description: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  district?: string;
  isAnonymous: boolean;
  mediaUris: string[];
}

export interface OfflineQueueItem {
  id: string;
  draft: DraftIncident;
  mediaFiles: any[];
  createdAt: string;
  retryCount: number;
}

const DEFAULT_DRAFT: DraftIncident = {
  severity: 'MEDIUM',
  description: '',
  isAnonymous: false,
  mediaUris: [],
};

interface IncidentStore {
  draft: DraftIncident;
  offlineQueue: OfflineQueueItem[];
  updateDraft: (fields: Partial<DraftIncident>) => void;
  resetDraft: () => void;
  addToQueue: (draft: DraftIncident, mediaFiles: any[]) => void;
  removeFromQueue: (localId: string) => void;
  incrementRetry: (localId: string) => void;
}

export const useIncidentStore = create<IncidentStore>()(
  persist(
    (set) => ({
      draft: { ...DEFAULT_DRAFT },
      offlineQueue: [],
      updateDraft: (fields) => set((s) => ({ draft: { ...s.draft, ...fields } })),
      resetDraft: () => set({ draft: { ...DEFAULT_DRAFT } }),
      addToQueue: (draft, mediaFiles) =>
        set((s) => ({
          offlineQueue: [
            ...s.offlineQueue,
            {
              id: `offline-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              draft,
              mediaFiles,
              createdAt: new Date().toISOString(),
              retryCount: 0,
            },
          ],
        })),
      removeFromQueue: (localId) =>
        set((s) => ({ offlineQueue: s.offlineQueue.filter((i) => i.id !== localId) })),
      incrementRetry: (localId) =>
        set((s) => ({
          offlineQueue: s.offlineQueue.map((i) =>
            i.id === localId ? { ...i, retryCount: i.retryCount + 1 } : i
          ),
        })),
    }),
    {
      name: 'incident-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

import { useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { getQueuedIncidents, removeFromQueue, incrementRetryCount } from '../db/offlineDb';
import { apiClient } from '../api/client';

const MAX_RETRIES = 5;

export function useOfflineQueue() {
  const syncingRef = useRef(false);

  const syncQueue = async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;

    try {
      const items = getQueuedIncidents();
      for (const item of items) {
        if (item.retry_count >= MAX_RETRIES) {
          removeFromQueue(item.id);
          continue;
        }
        try {
          const payload = JSON.parse(item.payload);
          const incidentRes = await apiClient.post('/incidents', payload);
          const incidentId = incidentRes.data.data.id;

          const mediaPaths: string[] = item.media_paths ? JSON.parse(item.media_paths) : [];
          for (const uri of mediaPaths) {
            try {
              const formData = new FormData();
              formData.append('file', { uri, type: 'image/jpeg', name: 'photo.jpg' } as any);
              await apiClient.post(`/incidents/${incidentId}/media`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
              });
            } catch {
              // media upload failure is non-fatal
            }
          }
          removeFromQueue(item.id);
        } catch (err: any) {
          incrementRetryCount(item.id, err?.message ?? 'Unknown error');
        }
      }
    } finally {
      syncingRef.current = false;
    }
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        syncQueue();
      }
    });
    return unsubscribe;
  }, []);
}

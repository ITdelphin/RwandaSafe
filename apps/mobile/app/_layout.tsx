import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSettingsStore } from '../src/store/settingsStore';
import { initOfflineDb } from '../src/db/offlineDb';
import { setLocale } from '../src/i18n';

const queryClient = new QueryClient();

export default function RootLayout() {
  const language = useSettingsStore((s) => s.language);

  useEffect(() => {
    initOfflineDb();
    setLocale(language);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}

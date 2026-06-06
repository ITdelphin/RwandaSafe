'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Flame } from 'lucide-react';
import { SplashScreen } from '../components/shared/SplashScreen';

export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 10000 } } }));
  const [splashDone, setSplashDone] = useState(false);

  return (
    <QueryClientProvider client={qc}>
      {!splashDone && (
        <SplashScreen
          onComplete={() => setSplashDone(true)}
          color="#E8710A"
          icon={<Flame size={44} color="white" />}
          agencyName="Fire Brigade"
        />
      )}
      <div style={{ opacity: splashDone ? 1 : 0, transition: 'opacity 0.4s ease' }}>
        {children}
      </div>
    </QueryClientProvider>
  );
}

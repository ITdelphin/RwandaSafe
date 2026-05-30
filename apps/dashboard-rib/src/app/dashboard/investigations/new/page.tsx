'use client';
export const dynamic = 'force-dynamic';
import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function NewInvestigationRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patternId = searchParams.get('patternId');

  useEffect(() => {
    const url = patternId
      ? `/dashboard/investigations?patternId=${patternId}&openCreate=1`
      : '/dashboard/investigations?openCreate=1';
    router.replace(url);
  }, [patternId, router]);

  return <div className="flex items-center justify-center h-64 text-gray-400">Redirecting...</div>;
}

export default function NewInvestigationPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>}>
      <NewInvestigationRedirect />
    </Suspense>
  );
}

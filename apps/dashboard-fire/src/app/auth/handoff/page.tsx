'use client';
import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

function HandoffReceiver() {
    const router = useRouter();
    const setAuth = useAuthStore(s => s.setAuth);

    useEffect(() => {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const at = params.get('at');
        const rt = params.get('rt');

        if (at && rt) {
            setAuth(at, rt);
            window.history.replaceState(null, '', '/');
            router.replace('/');
        } else {
            router.replace('/login');
        }
    }, [router, setAuth]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Authenticating...</p>
            </div>
        </div>
    );
}

export default function HandoffPage() {
    return (
        <Suspense fallback={<div>Loading handoff...</div>}>
            <HandoffReceiver />
        </Suspense>
    );
}

'use client';
import { useAuthStore } from '../../store/authStore';

interface Props { title?: string; }

export function Topbar({ title }: Props) {
  const { user } = useAuthStore();
  const now = new Date().toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <div>
        {title && <h1 className="text-base font-semibold text-gray-800">{title}</h1>}
        <p className="text-xs text-gray-400">{now}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
          Live
        </div>
        <div className="text-xs text-gray-600 font-medium">
          {user?.name ?? 'Officer'} · RNP
        </div>
      </div>
    </header>
  );
}

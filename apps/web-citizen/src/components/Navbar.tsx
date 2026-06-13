'use client';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function Navbar() {
  const { isAuthenticated, logout, user } = useAuthStore();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-extrabold text-blue-900 flex items-center gap-2 tracking-tight">
          <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center text-white">
            <Shield size={18} />
          </div>
          Rwanda Safe
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6 mr-4">
            <Link href="/track" className="text-sm font-semibold text-gray-600 hover:text-blue-900 transition-colors">Track Report</Link>
            <Link href="/map" className="text-sm font-semibold text-gray-600 hover:text-blue-900 transition-colors">Emergency Map</Link>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link href="/my-reports" className="text-sm font-bold text-gray-700 hover:text-blue-900">
                My Reports
              </Link>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 text-xs font-bold border border-blue-200">
                {user?.phone?.slice(-2) || '??'}
              </div>
              <button
                onClick={logout}
                className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <Link href="/my-reports?login=1"
              className="bg-blue-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-800 transition-all shadow-md shadow-blue-900/10 active:scale-95"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

'use client';
import Link from 'next/link';
import { useAuthStore } from '../store/authStore';

export function Navbar() {
  const { isAuthenticated, logout } = useAuthStore();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
      <Link href="/" className="text-xl font-bold text-blue-800">🛡️ Rwanda Safe</Link>
      <div className="flex items-center gap-4">
        <Link href="/track" className="text-sm text-gray-600 hover:text-blue-800">Track Report</Link>
        <Link href="/map" className="text-sm text-gray-600 hover:text-blue-800">Map</Link>
        {isAuthenticated ? (
          <>
            <Link href="/my-reports" className="text-sm text-gray-600 hover:text-blue-800">My Reports</Link>
            <button onClick={logout} className="text-sm text-red-600 hover:text-red-800">Log Out</button>
          </>
        ) : (
          <Link href="/my-reports" className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-900">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}

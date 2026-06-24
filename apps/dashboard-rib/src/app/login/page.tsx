'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { LoginPage } from '@rwanda-safe/ui-components';
import { authApi } from '../../lib/apiClient';
import { useAuthStore } from '../../store/authStore';

export default function RibLoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const handleLogin = async (email: string, password: string, remember: boolean) => {
    const res = await authApi.login(email, password);
    const { accessToken, user, dashboardAccess } = (res as any).data.data;

    if (user.role === 'CITIZEN') {
      throw { response: { data: { message: 'This portal is for RIB investigators only. Citizens please use the Rwanda Safe citizen portal.' } } };
    }

    const hasRibAccess = Array.isArray(dashboardAccess) && dashboardAccess.includes('RIB');
    if (!hasRibAccess) {
      throw { response: { data: { message: 'Access denied. You do not have RIB dashboard access. Please contact the Super Administrator.' } } };
    }

    if (typeof window !== 'undefined') {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('dashboardAccess', JSON.stringify(dashboardAccess));
    }
    login(user, accessToken, remember);
    router.push('/dashboard');
  };

  return (
    <LoginPage
      agencyName="Rwanda Investigation Bureau"
      agencyRole="Investigation Portal"
      accentColor="#9334E6"
      icon={<Search size={26} color="white" />}
      portalLabel="Staff"
      subtitleText="Activated investigators only. Enter your credentials."
      onLogin={handleLogin}
      showRegisterLink
      registerPath="/register"
      registerLabel="New investigator?"
      infoText={
        <span>
          <strong>Staff Access Only.</strong> Register with a personal email, then wait for a Super Admin to activate your account before signing in.{' '}
          <Link href="/register" style={{ color: '#9334E6', fontWeight: 600 }}>Create account →</Link>
        </span>
      }
      infoBannerColor="#9334E6"
      infoBannerBg="#FAF5FF"
      infoBannerBorder="#E9D5FF"
      infoBannerText="#6B21A8"
    />
  );
}

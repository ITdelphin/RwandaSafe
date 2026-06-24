'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Flame, Info } from 'lucide-react';
import { LoginPage } from '@rwanda-safe/ui-components';
import { authApi } from '../../lib/apiClient';
import { useAuthStore } from '../../store/authStore';

export default function FireLoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const handleLogin = async (email: string, password: string, remember: boolean) => {
    const res = await authApi.login(email, password);
    const { accessToken, user, dashboardAccess } = (res as any).data.data;

    if (user.role === 'CITIZEN') {
      throw { response: { data: { message: 'This portal is for Fire Brigade staff only. Citizens please use the Rwanda Safe citizen portal.' } } };
    }

    const hasFireAccess = Array.isArray(dashboardAccess) && dashboardAccess.includes('FIRE');
    if (!hasFireAccess) {
      throw { response: { data: { message: 'Access denied. You do not have Fire dashboard access. Please contact the Super Administrator.' } } };
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
      agencyName="Rwanda Fire Brigade"
      agencyRole="Dispatcher Portal"
      accentColor="#E8710A"
      icon={<Flame size={26} color="white" />}
      portalLabel="Staff"
      subtitleText="Activated dispatchers only. Enter your credentials."
      onLogin={handleLogin}
      showRegisterLink
      registerPath="/register"
      registerLabel="New dispatcher?"
      infoText={
        <span>
          <strong>Staff Access Only.</strong> Register with a personal email, then wait for a Super Admin to activate your account before signing in.{' '}
          <Link href="/register" style={{ color: '#E8710A', fontWeight: 600 }}>Create account →</Link>
        </span>
      }
      infoBannerColor="#E8710A"
      infoBannerBg="#FFF7ED"
      infoBannerBorder="#FED7AA"
      infoBannerText="#9A3412"
    />
  );
}

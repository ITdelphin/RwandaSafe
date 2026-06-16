'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { LoginPage } from '@rwanda-safe/ui-components';
import { authApi } from '../../lib/apiClient';
import { useAuthStore } from '../../store/authStore';

export default function PoliceLoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const handleLogin = async (email: string, password: string, remember: boolean) => {
    const res = await authApi.login(email, password);
    const { accessToken, user } = (res as any).data.data;
    login(user, accessToken, remember);
    router.push('/dashboard');
  };

  return (
    <LoginPage
      agencyName="Rwanda National Police"
      agencyRole="Officer Portal"
      accentColor="#1a73e8"
      icon={<Shield size={26} color="white" />}
      portalLabel="Staff"
      subtitleText="Activated officers only. Enter your credentials."
      onLogin={handleLogin}
      showRegisterLink
      registerPath="/register"
      registerLabel="New officer?"
      infoText={
        <span>
          <strong>Staff Access Only.</strong> Register with a personal email, then wait for a Super Admin to activate your account before signing in.{' '}
          <Link href="/register" style={{ color: '#1a73e8', fontWeight: 600 }}>Create account →</Link>
        </span>
      }
      infoBannerColor="#1a73e8"
      infoBannerBg="#EFF6FF"
      infoBannerBorder="#BFDBFE"
      infoBannerText="#1E40AF"
    />
  );
}

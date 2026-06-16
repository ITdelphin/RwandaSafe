'use client';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import { LoginPage } from '@rwanda-safe/ui-components';
import { authApi } from '../../lib/apiClient';
import { useAuthStore } from '../../store/authStore';

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const handleLogin = async (email: string, password: string, remember: boolean) => {
    const res = await authApi.login(email, password);
    const { accessToken, user } = (res as any).data.data;
    if (user.role !== 'SUPER_ADMIN') {
      throw { response: { data: { message: 'This portal is for Super Administrators only' } } };
    }
    login(user, accessToken, remember);
    router.push('/dashboard');
  };

  return (
    <LoginPage
      agencyName="Rwanda Safe"
      agencyRole="Government Control Center"
      accentColor="#0F4C75"
      icon={<Shield size={26} color="white" />}
      portalLabel="Admin"
      subtitleText="Enter your admin credentials"
      onLogin={handleLogin}
      gradientFrom="#0F172A"
      gradientVia="#1E3A5F"
      gradientTo="#0F4C75"
    />
  );
}

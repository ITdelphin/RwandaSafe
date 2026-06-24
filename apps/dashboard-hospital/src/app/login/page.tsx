'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Stethoscope } from 'lucide-react';
import { LoginPage } from '@rwanda-safe/ui-components';
import { authApi } from '../../lib/apiClient';
import { useAuthStore } from '../../store/authStore';

export default function HospitalLoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const handleLogin = async (email: string, password: string, remember: boolean) => {
    const res = await authApi.login(email, password);
    const { accessToken, user, dashboardAccess } = (res as any).data.data;

    if (user.role === 'CITIZEN') {
      throw { response: { data: { message: 'This portal is for Hospital staff only. Citizens please use the Rwanda Safe citizen portal.' } } };
    }

    const hasHospitalAccess = Array.isArray(dashboardAccess) && dashboardAccess.includes('HOSPITAL');
    if (!hasHospitalAccess) {
      throw { response: { data: { message: 'Access denied. You do not have Hospital dashboard access. Please contact the Super Administrator.' } } };
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
      agencyName="King Faisal Hospital SAMU"
      agencyRole="Medical Portal"
      accentColor="#34A853"
      icon={<Stethoscope size={26} color="white" />}
      portalLabel="Staff"
      subtitleText="Activated medical staff only. Enter your credentials."
      onLogin={handleLogin}
      showRegisterLink
      registerPath="/register"
      registerLabel="New medical staff?"
      infoText={
        <span>
          <strong>Staff Access Only.</strong> Register with a personal email, then wait for a Super Admin to activate your account before signing in.{' '}
          <Link href="/register" style={{ color: '#34A853', fontWeight: 600 }}>Create account →</Link>
        </span>
      }
      infoBannerColor="#34A853"
      infoBannerBg="#F0FDF4"
      infoBannerBorder="#BBF7D0"
      infoBannerText="#166534"
    />
  );
}

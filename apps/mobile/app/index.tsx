import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';

export default function Index() {
  const { isAuthenticated, isAnonymous } = useAuthStore();
  if (isAuthenticated || isAnonymous) return <Redirect href="/(app)/home" />;
  return <Redirect href="/(auth)/welcome" />;
}

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { authApi } from '../../src/api/auth';
import { useAuthStore } from '../../src/store/authStore';
import { Colors } from '../../src/constants/colors';

export default function VerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const inputs = useRef<(TextInput | null)[]>([]);
  const { setAuth } = useAuthStore();

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleDigit = (idx: number, val: string) => {
    const d = val.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[idx] = d;
    setCode(next);
    if (d && idx < 5) inputs.current[idx + 1]?.focus();
    if (next.every((c) => c !== '')) handleVerify(next.join(''));
  };

  const handleVerify = async (fullCode?: string) => {
    const otp = fullCode ?? code.join('');
    if (otp.length < 6) return;
    setLoading(true);
    setError('');
    try {
      const res = await authApi.verifyOtp(phone!, otp);
      const { accessToken, refreshToken, user } = res.data.data;
      setAuth(user, accessToken, refreshToken);
      router.replace('/(app)/home');
    } catch {
      setError('Invalid code. Please try again.');
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      await authApi.requestOtp(phone!);
      setResendTimer(60);
      Alert.alert('Sent', 'A new code has been sent.');
    } catch {
      Alert.alert('Error', 'Failed to resend OTP.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Enter verification code</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to {phone}</Text>

        <View style={styles.codeRow}>
          {code.map((digit, i) => (
            <TextInput
              key={i}
              ref={(r) => { inputs.current[i] = r; }}
              style={[styles.box, error ? styles.boxError : null]}
              value={digit}
              onChangeText={(v) => handleDigit(i, v)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {loading && <ActivityIndicator color={Colors.primary} style={{ marginTop: 16 }} />}

        <TouchableOpacity onPress={handleResend} disabled={resendTimer > 0} style={styles.resend}>
          <Text style={[styles.resendText, resendTimer > 0 && styles.resendDisabled]}>
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  back: { padding: 16 },
  backText: { color: Colors.primary, fontSize: 16 },
  content: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 32 },
  codeRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  box: {
    width: 46, height: 56, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 10, textAlign: 'center', fontSize: 22, fontWeight: 'bold',
    backgroundColor: Colors.surface, color: Colors.textPrimary,
  },
  boxError: { borderColor: Colors.error },
  error: { color: Colors.error, textAlign: 'center', marginTop: 12, fontSize: 13 },
  resend: { marginTop: 24, alignItems: 'center' },
  resendText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  resendDisabled: { color: Colors.textMuted },
});

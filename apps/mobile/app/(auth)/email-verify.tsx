import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { authApi } from '../../src/api/auth';
import { Colors } from '../../src/constants/colors';
import { useAuthStore } from '../../src/store/authStore';

export default function EmailVerifyScreen() {
    const { email } = useLocalSearchParams<{ email: string }>();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const setAuth = useAuthStore(s => s.setAuth);

    const handleVerify = async () => {
        if (code.length !== 6) return;
        setLoading(true);
        try {
            const { data } = await authApi.verifyEmailOtp(email, code);
            setAuth(data.data.user, data.data.accessToken, data.data.refreshToken);
            router.replace('/(app)/home');
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Invalid code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity style={styles.back} onPress={() => router.back()}>
                <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            <View style={styles.content}>
                <Text style={styles.title}>Enter verification code</Text>
                <Text style={styles.subtitle}>Sent to {email}</Text>

                <TextInput
                    style={styles.input}
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                    placeholder="000000"
                    placeholderTextColor={Colors.textMuted}
                />

                <TouchableOpacity style={styles.btn} onPress={handleVerify} disabled={loading || code.length !== 6}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify</Text>}
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
    input: {
        backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
        borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 24, color: Colors.textPrimary,
        textAlign: 'center', letterSpacing: 8,
    },
    btn: {
        backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 12,
        alignItems: 'center', marginTop: 24,
    },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

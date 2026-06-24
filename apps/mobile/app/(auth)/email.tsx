import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { authApi } from '../../src/api/auth';
import { Colors } from '../../src/constants/colors';
import { useSettingsStore } from '../../src/store/settingsStore';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailScreen() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { language } = useSettingsStore();

    const handleSend = async () => {
        const cleaned = email.trim();
        if (!EMAIL_REGEX.test(cleaned)) {
            setError('Please enter a valid email address');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await authApi.requestEmailOtp(cleaned, language);
            router.push({ pathname: '/(auth)/email-verify', params: { email: cleaned } });
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Failed to send OTP');
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
                <Text style={styles.title}>Enter your email</Text>
                <Text style={styles.subtitle}>We'll send a verification code to your email</Text>

                <View style={styles.inputRow}>
                    <TextInput
                        style={[styles.input, error ? styles.inputError : null]}
                        value={email}
                        onChangeText={(v) => { setEmail(v); setError(''); }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoFocus
                        placeholder="you@example.com"
                        placeholderTextColor={Colors.textMuted}
                    />
                </View>
                {error ? <Text style={styles.error}>{error}</Text> : null}

                <TouchableOpacity style={styles.btn} onPress={handleSend} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send Code</Text>}
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
    inputRow: { flexDirection: 'row' },
    input: {
        flex: 1, backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
        borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 18, color: Colors.textPrimary,
    },
    inputError: { borderColor: Colors.error },
    error: { color: Colors.error, marginTop: 8, fontSize: 13 },
    btn: {
        backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 12,
        alignItems: 'center', marginTop: 24,
    },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useAuthStore } from '../../src/store/authStore';
import { Colors } from '../../src/constants/colors';
import { t } from '../../src/i18n';

const LANGUAGES = [
  { key: 'en' as const, label: 'English' },
  { key: 'rw' as const, label: 'Ikinyarwanda' },
  { key: 'fr' as const, label: 'Français' },
];

export default function WelcomeScreen() {
  const { language, setLanguage } = useSettingsStore();
  const { setAnonymous } = useAuthStore();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.logo}>🛡️</Text>
        <Text style={styles.title}>{t('app_name')}</Text>
        <Text style={styles.tagline}>{t('tagline')}</Text>
      </View>

      <View style={styles.langSection}>
        <Text style={styles.langLabel}>{t('language')}</Text>
        <View style={styles.langButtons}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.key}
              style={[styles.langBtn, language === lang.key && styles.langBtnActive]}
              onPress={() => setLanguage(lang.key)}
            >
              <Text style={[styles.langBtnText, language === lang.key && styles.langBtnTextActive]}>
                {lang.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(auth)/phone')}>
          <Text style={styles.primaryBtnText}>{t('get_started')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => { setAnonymous(); router.replace('/(app)/home'); }}
        >
          <Text style={styles.secondaryBtnText}>{t('continue_as_guest')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'space-between', padding: 24 },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { fontSize: 72, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: 'bold', color: Colors.primary, marginBottom: 8 },
  tagline: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center' },
  langSection: { marginBottom: 32 },
  langLabel: { fontSize: 14, color: Colors.textSecondary, marginBottom: 12, textAlign: 'center' },
  langButtons: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  langBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  langBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '15' },
  langBtnText: { fontSize: 14, color: Colors.textSecondary },
  langBtnTextActive: { color: Colors.primary, fontWeight: '600' },
  actions: { gap: 12 },
  primaryBtn: {
    backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryBtn: {
    paddingVertical: 16, borderRadius: 12, alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border,
  },
  secondaryBtnText: { color: Colors.textSecondary, fontSize: 16 },
});

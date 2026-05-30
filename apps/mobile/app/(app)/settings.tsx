import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { Colors } from '../../src/constants/colors';

const LANGUAGES = [
  { key: 'en' as const, label: 'English' },
  { key: 'rw' as const, label: 'Ikinyarwanda' },
  { key: 'fr' as const, label: 'Français' },
];

export default function SettingsScreen() {
  const { user, logout } = useAuthStore();
  const { language, setLanguage, notificationsEnabled, setNotifications } = useSettingsStore();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)/welcome'); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language</Text>
        <View style={styles.langRow}>
          {LANGUAGES.map((l) => (
            <TouchableOpacity
              key={l.key}
              style={[styles.langBtn, language === l.key && styles.langBtnActive]}
              onPress={() => setLanguage(l.key)}
            >
              <Text style={[styles.langText, language === l.key && styles.langTextActive]}>{l.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Push notifications</Text>
          <Switch value={notificationsEnabled} onValueChange={setNotifications} trackColor={{ true: Colors.primary }} />
        </View>
      </View>

      {user && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Account</Text>
          <View style={styles.accountInfo}>
            <Text style={styles.accountPhone}>📱 {user.phone}</Text>
            {user.name && <Text style={styles.accountName}>{user.name}</Text>}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Rwanda Safe</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: Colors.textPrimary },
  section: { backgroundColor: Colors.surface, marginTop: 16, marginHorizontal: 16, borderRadius: 12, padding: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', marginBottom: 12 },
  langRow: { flexDirection: 'row', gap: 8 },
  langBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center' },
  langBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '15' },
  langText: { fontSize: 13, color: Colors.textSecondary },
  langTextActive: { color: Colors.primary, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 15, color: Colors.textPrimary },
  accountInfo: { gap: 4 },
  accountPhone: { fontSize: 15, color: Colors.textPrimary },
  accountName: { fontSize: 14, color: Colors.textSecondary },
  version: { fontSize: 14, color: Colors.textSecondary },
  logoutBtn: {
    margin: 16, backgroundColor: Colors.error + '15', paddingVertical: 16,
    borderRadius: 12, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.error,
  },
  logoutText: { color: Colors.error, fontSize: 16, fontWeight: '600' },
});

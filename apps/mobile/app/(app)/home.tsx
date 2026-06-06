import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Modal, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SOSButton } from '../../src/components/SOSButton';
import { OfflineBanner } from '../../src/components/OfflineBanner';
import { useOfflineQueue } from '../../src/hooks/useOfflineQueue';
import { useLocation } from '../../src/hooks/useLocation';
import { useCreateIncident } from '../../src/hooks/useIncidents';
import { Colors } from '../../src/constants/colors';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const QUICK_ACTIONS: { type: string; label: string; icon: IoniconName; color: string }[] = [
  { type: 'ACCIDENT',          label: 'Report Accident',   icon: 'car-outline',   color: Colors.accident },
  { type: 'CRIME',             label: 'Report Crime',      icon: 'alert-circle',  color: Colors.crime },
  { type: 'MEDICAL_EMERGENCY', label: 'Medical Emergency', icon: 'medkit',        color: Colors.medical },
  { type: 'FIRE',              label: 'Fire / Hazard',     icon: 'flame',         color: Colors.fire },
];

const SOS_TYPES: { type: string; label: string; icon: IoniconName }[] = [
  { type: 'CRIME',             label: 'Police',   icon: 'shield-checkmark' },
  { type: 'MEDICAL_EMERGENCY', label: 'Medical',  icon: 'medkit' },
  { type: 'FIRE',              label: 'Fire',     icon: 'flame' },
  { type: 'OTHER',             label: 'Other',    icon: 'alert' },
];

export default function HomeScreen() {
  const [sosVisible, setSosVisible] = useState(false);
  const { latitude, longitude } = useLocation();
  const createIncident = useCreateIncident();
  useOfflineQueue();

  const handleSOS = async (type: string) => {
    setSosVisible(false);
    if (!latitude || !longitude) {
      Alert.alert('Location unavailable', 'Please enable location services.');
      return;
    }
    try {
      const result = await createIncident.mutateAsync({
        type,
        description: `SOS - ${type} emergency`,
        latitude,
        longitude,
        severity: 'CRITICAL',
      });
      router.push(`/(app)/report/${result.id}`);
    } catch {
      Alert.alert('Error', 'Failed to create SOS report. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <OfflineBanner />

      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="shield-checkmark" size={22} color={Colors.primary} />
          <Text style={styles.headerTitle}> Rwanda Safe</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.sosSection}>
          <Text style={styles.sosHint}>Press for emergency help</Text>
          <SOSButton onPress={() => setSosVisible(true)} />
        </View>

        <Text style={styles.sectionTitle}>Quick Report</Text>
        <View style={styles.grid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.type}
              style={[styles.card, { borderLeftColor: action.color }]}
              onPress={() => router.push({ pathname: '/(app)/report', params: { type: action.type } })}
            >
              <Ionicons name={action.icon} size={28} color={action.color} style={styles.cardIcon} />
              <Text style={styles.cardLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal visible={sosVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select emergency type</Text>
            {SOS_TYPES.map((t) => (
              <TouchableOpacity key={t.type} style={styles.sosOption} onPress={() => handleSOS(t.type)}>
                <Ionicons name={t.icon} size={24} color={Colors.emergency} style={styles.sosOptionIcon} />
                <Text style={styles.sosOptionLabel}>{t.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setSosVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {createIncident.isPending && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.overlayText}>Sending SOS...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.primary },
  scroll: { padding: 16, alignItems: 'center' },
  sosSection: { alignItems: 'center', marginVertical: 32 },
  sosHint: { fontSize: 14, color: Colors.textSecondary, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, alignSelf: 'flex-start', marginBottom: 12, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, width: '100%' },
  card: {
    width: '47%', backgroundColor: Colors.surface, borderRadius: 12, padding: 16,
    borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
  },
  cardIcon: { marginBottom: 8 },
  cardLabel: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: Colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 20, textAlign: 'center' },
  sosOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sosOptionIcon: { marginRight: 16 },
  sosOptionLabel: { fontSize: 16, color: Colors.textPrimary, fontWeight: '500' },
  cancelBtn: { marginTop: 16, paddingVertical: 14, alignItems: 'center' },
  cancelText: { fontSize: 16, color: Colors.textSecondary },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  overlayText: { color: '#fff', marginTop: 12, fontSize: 16 },
});

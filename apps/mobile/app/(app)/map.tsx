import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Linking, Platform } from 'react-native';
import { Colors } from '../../src/constants/colors';

const EMERGENCY_NUMBERS = [
  { label: 'Police', number: '112', color: Colors.crime },
  { label: 'Ambulance', number: '912', color: Colors.medical },
  { label: 'Fire', number: '111', color: Colors.fire },
];

export default function MapScreen() {
  const call = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.emergencyStrip}>
        {EMERGENCY_NUMBERS.map((e) => (
          <TouchableOpacity key={e.number} style={[styles.emergencyBtn, { backgroundColor: e.color }]} onPress={() => call(e.number)}>
            <Text style={styles.emergencyLabel}>{e.label}</Text>
            <Text style={styles.emergencyNumber}>{e.number}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapIcon}>🗺️</Text>
        <Text style={styles.mapText}>Map view</Text>
        <Text style={styles.mapSubtext}>
          Add your Google Maps API key to {Platform.OS === 'ios' ? 'app.json' : 'app.json'} to enable the full map.
        </Text>
        <Text style={styles.mapSubtext}>Nearby services will appear as markers.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  emergencyStrip: {
    flexDirection: 'row', padding: 12, gap: 8, backgroundColor: Colors.surface,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  emergencyBtn: { flex: 1, borderRadius: 10, padding: 12, alignItems: 'center' },
  emergencyLabel: { color: '#fff', fontSize: 11, fontWeight: '600' },
  emergencyNumber: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  mapIcon: { fontSize: 64, marginBottom: 16 },
  mapText: { fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 8 },
  mapSubtext: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 },
});

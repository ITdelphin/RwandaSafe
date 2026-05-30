import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
  TextInput, Switch, ActivityIndicator, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useLocation } from '../../src/hooks/useLocation';
import { useIncidentStore } from '../../src/store/incidentStore';
import { incidentsApi } from '../../src/api/incidents';
import { MediaPicker } from '../../src/components/MediaPicker';
import { Colors } from '../../src/constants/colors';
import { INCIDENT_TYPES, RWANDA_DISTRICTS } from '../../src/constants/incidentTypes';
import { queueIncident } from '../../src/db/offlineDb';
import NetInfo from '@react-native-community/netinfo';

const SEVERITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
const SEVERITY_COLORS = { LOW: Colors.success, MEDIUM: Colors.warning, HIGH: Colors.accident, CRITICAL: Colors.emergency };

export default function ReportScreen() {
  const params = useLocalSearchParams<{ type?: string }>();
  const { latitude, longitude, requestLocation } = useLocation();
  const { draft, updateDraft, resetDraft } = useIncidentStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Pre-select type from params
  React.useEffect(() => {
    if (params.type) updateDraft({ type: params.type });
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const netState = await NetInfo.fetch();
      const payload = {
        type: draft.type,
        severity: draft.severity,
        description: draft.description,
        latitude: draft.latitude ?? latitude ?? 0,
        longitude: draft.longitude ?? longitude ?? 0,
        address: draft.address,
        district: draft.district,
        isAnonymous: draft.isAnonymous,
      };

      if (!netState.isConnected) {
        const offlineId = `offline-${Date.now()}`;
        queueIncident(offlineId, payload, draft.mediaUris);
        Alert.alert('Saved offline', 'Your report will be sent when you\'re back online.');
        resetDraft();
        router.replace('/(app)/my-reports');
        return;
      }

      const res = await incidentsApi.create(payload);
      const incident = res.data.data;

      for (const uri of draft.mediaUris) {
        try {
          const fd = new FormData();
          fd.append('file', { uri, type: 'image/jpeg', name: 'photo.jpg' } as any);
          await incidentsApi.uploadMedia(incident.id, fd);
        } catch { /* non-fatal */ }
      }

      resetDraft();
      router.replace(`/(app)/report/${incident.id}`);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 0 ? setStep(s => s - 1) : router.back()}>
          <Text style={styles.back}>← {step > 0 ? 'Back' : 'Cancel'}</Text>
        </TouchableOpacity>
        <Text style={styles.stepLabel}>Step {step + 1} of 3</Text>
      </View>

      <View style={styles.progress}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {step === 0 && (
          <Step1
            draft={draft}
            updateDraft={updateDraft}
            onNext={() => setStep(1)}
          />
        )}
        {step === 1 && (
          <Step2
            draft={draft}
            updateDraft={updateDraft}
            latitude={latitude}
            longitude={longitude}
            requestLocation={requestLocation}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <Step3
            draft={draft}
            updateDraft={updateDraft}
            onSubmit={handleSubmit}
            loading={loading}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Step1({ draft, updateDraft, onNext }: any) {
  const canNext = draft.type && draft.description.length >= 10;
  return (
    <View>
      <Text style={styles.stepTitle}>What happened?</Text>
      <View style={styles.typeGrid}>
        {INCIDENT_TYPES.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.typeBtn, draft.type === t.key && { borderColor: t.color, backgroundColor: t.color + '15' }]}
            onPress={() => updateDraft({ type: t.key })}
          >
            <Text style={styles.typeBtnIcon}>{t.icon}</Text>
            <Text style={styles.typeBtnLabel}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.fieldLabel}>Severity</Text>
      <View style={styles.severityRow}>
        {SEVERITY_OPTIONS.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.severityBtn, draft.severity === s && { backgroundColor: SEVERITY_COLORS[s], borderColor: SEVERITY_COLORS[s] }]}
            onPress={() => updateDraft({ severity: s })}
          >
            <Text style={[styles.severityText, draft.severity === s && { color: '#fff' }]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.fieldLabel}>Description</Text>
      <TextInput
        style={styles.textarea}
        value={draft.description}
        onChangeText={(v) => updateDraft({ description: v })}
        placeholder="Please provide as much detail as possible..."
        placeholderTextColor={Colors.textMuted}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
      />

      <View style={styles.anonRow}>
        <Text style={styles.anonLabel}>Report anonymously</Text>
        <Switch
          value={draft.isAnonymous}
          onValueChange={(v) => updateDraft({ isAnonymous: v })}
          trackColor={{ true: Colors.primary }}
        />
      </View>
      {draft.isAnonymous && (
        <Text style={styles.anonHint}>Your identity will be hidden from responders</Text>
      )}

      <TouchableOpacity style={[styles.nextBtn, !canNext && styles.nextBtnDisabled]} onPress={onNext} disabled={!canNext}>
        <Text style={styles.nextBtnText}>Next →</Text>
      </TouchableOpacity>
    </View>
  );
}

function Step2({ draft, updateDraft, latitude, longitude, requestLocation, onNext }: any) {
  const [districtOpen, setDistrictOpen] = useState(false);
  const canNext = draft.latitude || latitude;

  return (
    <View>
      <Text style={styles.stepTitle}>Where?</Text>

      <View style={styles.locationBox}>
        <Text style={styles.locationText}>
          {draft.latitude
            ? `📍 ${draft.latitude.toFixed(5)}, ${draft.longitude?.toFixed(5)}`
            : latitude
            ? `📍 ${latitude.toFixed(5)}, ${longitude?.toFixed(5)}`
            : '📍 Location not detected'}
        </Text>
        <TouchableOpacity
          style={styles.locationBtn}
          onPress={() => {
            requestLocation();
            if (latitude) updateDraft({ latitude, longitude });
          }}
        >
          <Text style={styles.locationBtnText}>Use my location</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.fieldLabel}>Address (optional)</Text>
      <TextInput
        style={styles.input}
        value={draft.address ?? ''}
        onChangeText={(v) => updateDraft({ address: v })}
        placeholder="e.g. KN 5 Road, Kigali"
        placeholderTextColor={Colors.textMuted}
      />

      <Text style={styles.fieldLabel}>District</Text>
      <TouchableOpacity style={styles.input} onPress={() => setDistrictOpen(!districtOpen)}>
        <Text style={{ color: draft.district ? Colors.textPrimary : Colors.textMuted }}>
          {draft.district ?? 'Select district...'}
        </Text>
      </TouchableOpacity>
      {districtOpen && (
        <ScrollView style={styles.districtList} nestedScrollEnabled>
          {RWANDA_DISTRICTS.map((d) => (
            <TouchableOpacity key={d} style={styles.districtItem} onPress={() => { updateDraft({ district: d }); setDistrictOpen(false); }}>
              <Text style={styles.districtItemText}>{d}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity style={[styles.nextBtn, !canNext && styles.nextBtnDisabled]} onPress={() => { if (!draft.latitude && latitude) updateDraft({ latitude, longitude }); onNext(); }} disabled={!canNext}>
        <Text style={styles.nextBtnText}>Next →</Text>
      </TouchableOpacity>
    </View>
  );
}

function Step3({ draft, updateDraft, onSubmit, loading }: any) {
  return (
    <View>
      <Text style={styles.stepTitle}>Evidence (optional)</Text>
      <Text style={styles.fieldLabel}>Photos / Video (up to 5)</Text>
      <MediaPicker
        uris={draft.mediaUris}
        onAdd={(uri) => updateDraft({ mediaUris: [...draft.mediaUris, uri] })}
        onRemove={(uri) => updateDraft({ mediaUris: draft.mediaUris.filter((u: string) => u !== uri) })}
      />

      <TouchableOpacity style={[styles.nextBtn, { backgroundColor: Colors.emergency }]} onPress={onSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.nextBtnText}>Submit Report</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  back: { color: Colors.primary, fontSize: 16 },
  stepLabel: { fontSize: 13, color: Colors.textSecondary },
  progress: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.primary, width: 24 },
  content: { padding: 16, paddingBottom: 40 },
  stepTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 20 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  typeBtn: {
    width: '30%', alignItems: 'center', padding: 12, borderRadius: 12,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  typeBtnIcon: { fontSize: 24, marginBottom: 4 },
  typeBtnLabel: { fontSize: 11, color: Colors.textPrimary, textAlign: 'center' },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginTop: 16, marginBottom: 8 },
  severityRow: { flexDirection: 'row', gap: 8 },
  severityBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border,
  },
  severityText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  textarea: {
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 12, padding: 12, fontSize: 14, color: Colors.textPrimary, minHeight: 120,
  },
  anonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  anonLabel: { fontSize: 15, color: Colors.textPrimary },
  anonHint: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  input: {
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 14, fontSize: 14, color: Colors.textPrimary,
  },
  locationBox: {
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 12, padding: 16, marginBottom: 16,
  },
  locationText: { fontSize: 14, color: Colors.textPrimary, marginBottom: 12 },
  locationBtn: { backgroundColor: Colors.primary + '15', padding: 10, borderRadius: 8, alignItems: 'center' },
  locationBtnText: { color: Colors.primary, fontWeight: '600' },
  districtList: { maxHeight: 200, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, marginTop: 4 },
  districtItem: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  districtItemText: { fontSize: 14, color: Colors.textPrimary },
  nextBtn: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 32 },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

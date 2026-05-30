import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useIncident, useAddNote, useCancelIncident } from '../../../src/hooks/useIncidents';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { Colors } from '../../../src/constants/colors';
import { joinIncidentRoom, leaveIncidentRoom, getSocket } from '../../../src/lib/socket';
import { useAuthStore } from '../../../src/store/authStore';

const STATUS_STEPS = ['RECEIVED', 'UNDER_REVIEW', 'ASSIGNED', 'DISPATCHED', 'ON_SCENE', 'RESOLVED'];

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: incident, refetch } = useIncident(id!);
  const addNote = useAddNote(id!);
  const cancelIncident = useCancelIncident();
  const { user } = useAuthStore();
  const [message, setMessage] = useState('');
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    joinIncidentRoom(id);
    const socket = getSocket();
    socket.on('message:new', (note: any) => setNotes((prev) => [...prev, note]));
    socket.on('incident:updated', () => refetch());
    return () => {
      leaveIncidentRoom(id);
      socket.off('message:new');
      socket.off('incident:updated');
    };
  }, [id]);

  useEffect(() => {
    if (incident?.notes) setNotes(incident.notes.filter((n: any) => !n.isInternal));
  }, [incident]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    try {
      await addNote.mutateAsync({ note: message, isInternal: false });
      setMessage('');
    } catch { Alert.alert('Error', 'Failed to send message'); }
  };

  const handleCancel = () => {
    Alert.alert('Cancel Report', 'Are you sure you want to cancel this report?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: async () => {
        await cancelIncident.mutateAsync(id!);
        router.back();
      }},
    ]);
  };

  if (!incident) return null;

  const stepIndex = STATUS_STEPS.indexOf(incident.status);
  const canCancel = ['RECEIVED', 'UNDER_REVIEW'].includes(incident.status);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Tracking Code */}
          <View style={styles.trackingBox}>
            <Text style={styles.trackingLabel}>Tracking Code</Text>
            <Text style={styles.trackingCode}>{incident.trackingCode}</Text>
            <StatusBadge status={incident.status} />
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              {STATUS_STEPS.map((step, i) => (
                <View key={step} style={styles.progressStep}>
                  <View style={[styles.progressDot, i <= stepIndex && styles.progressDotActive]} />
                  {i < STATUS_STEPS.length - 1 && (
                    <View style={[styles.progressLine, i < stepIndex && styles.progressLineActive]} />
                  )}
                </View>
              ))}
            </View>
            <View style={styles.progressLabels}>
              {STATUS_STEPS.map((step) => (
                <Text key={step} style={styles.progressLabel}>{step.replace(/_/g, ' ')}</Text>
              ))}
            </View>
          </View>

          {/* Status Timeline */}
          <Text style={styles.sectionTitle}>Timeline</Text>
          {(incident.statusHistory ?? []).map((h: any, i: number) => (
            <View key={i} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineStatus}>{h.newStatus.replace(/_/g, ' ')}</Text>
                {h.note && <Text style={styles.timelineNote}>{h.note}</Text>}
                <Text style={styles.timelineDate}>{new Date(h.changedAt).toLocaleString()}</Text>
              </View>
            </View>
          ))}

          {/* Chat */}
          <Text style={styles.sectionTitle}>Messages</Text>
          <View style={styles.chatBox}>
            {notes.length === 0 && <Text style={styles.noMessages}>No messages yet.</Text>}
            {notes.map((note: any, i: number) => {
              const isMine = note.author?.id === user?.id;
              return (
                <View key={i} style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
                  <Text style={[styles.bubbleAuthor, isMine && { color: '#fff99' }]}>
                    {isMine ? 'You' : note.author?.name ?? 'Officer'}
                  </Text>
                  <Text style={[styles.bubbleText, isMine && { color: '#fff' }]}>{note.note}</Text>
                </View>
              );
            })}
          </View>

          {canCancel && (
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>Cancel Report</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Message Input */}
        <View style={styles.messageBar}>
          <TextInput
            style={styles.messageInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor={Colors.textMuted}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  back: { fontSize: 24, color: Colors.primary },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  content: { padding: 16, paddingBottom: 16 },
  trackingBox: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, marginBottom: 16, alignItems: 'center' },
  trackingLabel: { fontSize: 12, color: Colors.textMuted, marginBottom: 4 },
  trackingCode: { fontSize: 22, fontWeight: 'bold', color: Colors.primary, marginBottom: 8 },
  progressSection: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, marginBottom: 16 },
  progressBar: { flexDirection: 'row', alignItems: 'center' },
  progressStep: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.border },
  progressDotActive: { backgroundColor: Colors.primary },
  progressLine: { flex: 1, height: 2, backgroundColor: Colors.border },
  progressLineActive: { backgroundColor: Colors.primary },
  progressLabels: { flexDirection: 'row', marginTop: 8 },
  progressLabel: { flex: 1, fontSize: 8, color: Colors.textMuted, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginTop: 16, marginBottom: 12 },
  timelineItem: { flexDirection: 'row', marginBottom: 12 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary, marginTop: 4, marginRight: 12 },
  timelineContent: { flex: 1 },
  timelineStatus: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  timelineNote: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  timelineDate: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  chatBox: { backgroundColor: Colors.surface, borderRadius: 12, padding: 12, minHeight: 80, marginBottom: 16 },
  noMessages: { color: Colors.textMuted, textAlign: 'center', fontSize: 13 },
  bubble: { marginVertical: 4, padding: 10, borderRadius: 12, maxWidth: '80%' },
  bubbleMine: { backgroundColor: Colors.primary, alignSelf: 'flex-end' },
  bubbleOther: { backgroundColor: Colors.border, alignSelf: 'flex-start' },
  bubbleAuthor: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, marginBottom: 2 },
  bubbleText: { fontSize: 14, color: Colors.textPrimary },
  cancelBtn: { borderWidth: 1.5, borderColor: Colors.error, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  cancelBtnText: { color: Colors.error, fontWeight: '600', fontSize: 15 },
  messageBar: { flexDirection: 'row', padding: 8, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border, gap: 8 },
  messageInput: { flex: 1, backgroundColor: Colors.background, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: Colors.textPrimary },
  sendBtn: { backgroundColor: Colors.primary, borderRadius: 20, paddingHorizontal: 20, justifyContent: 'center' },
  sendBtnText: { color: '#fff', fontWeight: '600' },
});

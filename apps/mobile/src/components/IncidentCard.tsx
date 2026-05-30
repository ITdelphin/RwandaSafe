import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBadge } from './StatusBadge';
import { Colors } from '../constants/colors';
import { INCIDENT_TYPES } from '../constants/incidentTypes';

interface Props {
  incident: any;
  onPress: () => void;
}

export function IncidentCard({ incident, onPress }: Props) {
  const typeInfo = INCIDENT_TYPES.find((t) => t.key === incident.type);
  const timeAgo = formatTimeAgo(incident.createdAt);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.row}>
        <View style={[styles.iconBox, { backgroundColor: (typeInfo?.color ?? Colors.textMuted) + '22' }]}>
          <Text style={styles.icon}>{typeInfo?.icon ?? '❗'}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.code}>{incident.trackingCode}</Text>
          <Text style={styles.type}>{typeInfo?.label ?? incident.type}</Text>
          {incident.district ? <Text style={styles.district}>{incident.district}</Text> : null}
        </View>
        <View style={styles.right}>
          <StatusBadge status={incident.status} />
          <Text style={styles.time}>{timeAgo}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: { fontSize: 20 },
  info: { flex: 1 },
  code: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  type: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  district: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  right: { alignItems: 'flex-end', gap: 4 },
  time: { fontSize: 11, color: Colors.textMuted, marginTop: 4 },
});

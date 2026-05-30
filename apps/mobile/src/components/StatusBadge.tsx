import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

const STATUS_COLORS: Record<string, string> = {
  RECEIVED:     Colors.statusReceived,
  UNDER_REVIEW: Colors.statusReview,
  ASSIGNED:     Colors.statusAssigned,
  DISPATCHED:   Colors.statusDispatched,
  ON_SCENE:     Colors.statusOnScene,
  RESOLVED:     Colors.statusResolved,
  CLOSED:       Colors.statusClosed,
  CANCELLED:    Colors.statusCancelled,
};

const STATUS_LABELS: Record<string, string> = {
  RECEIVED:     'Received',
  UNDER_REVIEW: 'Under Review',
  ASSIGNED:     'Assigned',
  DISPATCHED:   'Dispatched',
  ON_SCENE:     'On Scene',
  RESOLVED:     'Resolved',
  CLOSED:       'Closed',
  CANCELLED:    'Cancelled',
};

export function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? Colors.textMuted;
  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{STATUS_LABELS[status] ?? status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 11, fontWeight: '600' },
});

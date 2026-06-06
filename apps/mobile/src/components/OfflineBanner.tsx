import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { Colors } from '../constants/colors';

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setOffline(!state.isConnected);
    });
    return unsub;
  }, []);

  if (!offline) return null;

  return (
    <View style={styles.banner}>
      <Ionicons name="cloud-offline-outline" size={16} color="white" />
      <Text style={styles.text}> You are offline</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.offline,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  text: { color: '#fff', fontWeight: '600', fontSize: 13 },
});

import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/colors';

interface Props {
  uris: string[];
  onAdd: (uri: string) => void;
  onRemove: (uri: string) => void;
  maxItems?: number;
}

export function MediaPicker({ uris, onAdd, onRemove, maxItems = 5 }: Props) {
  const pick = async () => {
    if (uris.length >= maxItems) {
      Alert.alert('Limit reached', `You can only add up to ${maxItems} files.`);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      onAdd(result.assets[0].uri);
    }
  };

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {uris.map((uri) => (
          <View key={uri} style={styles.thumb}>
            <Image source={{ uri }} style={styles.img} />
            <TouchableOpacity style={styles.remove} onPress={() => onRemove(uri)}>
              <Text style={styles.removeText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        {uris.length < maxItems && (
          <TouchableOpacity style={styles.addBtn} onPress={pick}>
            <Text style={styles.addIcon}>+</Text>
            <Text style={styles.addLabel}>Add Photo</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { marginTop: 8 },
  thumb: { width: 80, height: 80, marginRight: 8, borderRadius: 8, overflow: 'hidden' },
  img: { width: 80, height: 80 },
  remove: {
    position: 'absolute', top: 2, right: 2,
    backgroundColor: 'rgba(0,0,0,0.6)', width: 20, height: 20,
    borderRadius: 10, justifyContent: 'center', alignItems: 'center',
  },
  removeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  addBtn: {
    width: 80, height: 80, borderRadius: 8, borderWidth: 1.5,
    borderColor: Colors.border, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center',
  },
  addIcon: { fontSize: 24, color: Colors.textSecondary },
  addLabel: { fontSize: 10, color: Colors.textSecondary },
});

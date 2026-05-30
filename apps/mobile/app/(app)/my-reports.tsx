import React from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { IncidentCard } from '../../src/components/IncidentCard';
import { useIncidents } from '../../src/hooks/useIncidents';
import { Colors } from '../../src/constants/colors';
import { OfflineBanner } from '../../src/components/OfflineBanner';

export default function MyReportsScreen() {
  const { data, isLoading, refetch, isRefetching } = useIncidents();

  return (
    <SafeAreaView style={styles.container}>
      <OfflineBanner />
      <View style={styles.header}>
        <Text style={styles.title}>My Reports</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <IncidentCard
              incident={item}
              onPress={() => router.push(`/(app)/report/${item.id}`)}
            />
          )}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No reports yet. Stay safe!</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: Colors.textPrimary },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 16, color: Colors.textSecondary },
});

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: { borderTopColor: Colors.border },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size ?? 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-reports"
        options={{
          title: 'My Reports',
          tabBarIcon: ({ color, size }) => <Ionicons name="document-text-outline" size={size ?? 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => <Ionicons name="map-outline" size={size ?? 24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size ?? 24} color={color} />,
        }}
      />
      <Tabs.Screen name="report" options={{ href: null }} />
    </Tabs>
  );
}

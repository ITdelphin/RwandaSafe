import { Tabs } from 'expo-router';
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
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: ({ color }) => <TabIcon icon="🏠" color={color} /> }} />
      <Tabs.Screen name="my-reports" options={{ title: 'My Reports', tabBarIcon: ({ color }) => <TabIcon icon="📋" color={color} /> }} />
      <Tabs.Screen name="map" options={{ title: 'Map', tabBarIcon: ({ color }) => <TabIcon icon="🗺️" color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color }) => <TabIcon icon="⚙️" color={color} /> }} />
      <Tabs.Screen name="report" options={{ href: null }} />
    </Tabs>
  );
}

function TabIcon({ icon, color }: { icon: string; color: string }) {
  const { Text } = require('react-native');
  return <Text style={{ fontSize: 20, opacity: color === Colors.primary ? 1 : 0.5 }}>{icon}</Text>;
}

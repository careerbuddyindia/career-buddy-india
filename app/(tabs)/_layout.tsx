import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          height: 65 + (insets.bottom > 0 ? insets.bottom : (Platform.OS === 'android' ? 20 : 10)),
          paddingBottom: insets.bottom > 0 ? insets.bottom + 6 : (Platform.OS === 'android' ? 24 : 10),
          paddingTop: 8,
          elevation: 16,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Private Jobs',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'briefcase' : 'briefcase-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="letters"
        options={{
          title: 'Letter Generator',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'document-text' : 'document-text-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Guide & Policy',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'shield-checkmark' : 'shield-checkmark-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

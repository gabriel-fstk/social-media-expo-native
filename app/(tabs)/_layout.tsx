import { Tabs } from 'expo-router';
import { Users, FileText, Plus, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e5e5',
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
          height: 60 + Math.max(insets.bottom - 8, 0),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Posts',
          tabBarIcon: ({ size, color }) => <FileText size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Usuários',
          tabBarIcon: ({ size, color }) => <Users size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="create-post"
        options={{
          title: 'Novo Post',
          tabBarIcon: ({ size, color }) => <Plus size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

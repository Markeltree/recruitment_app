import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import AnimatedTabBar from '../../components/AnimatedTabBar';
import { useNotifications } from '../../store/notifications';

const icon =
  (name) =>
  ({ focused, color }) => <Ionicons name={focused ? name : `${name}-outline`} size={22} color={color} />;

export default function TabsLayout() {
  const unread = useNotifications((s) => s.unread);

  return (
    <>
      {/* Every tab opens on a dark gradient hero, so status bar icons stay light */}
      <StatusBar style="light" />
      <Tabs
        tabBar={(props) => <AnimatedTabBar {...props} />}
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: '#F5F7FB' }, animation: 'shift' }}
      >
        <Tabs.Screen name="index" options={{ title: 'Discover', tabBarIcon: icon('compass') }} />
        <Tabs.Screen name="applications" options={{ title: 'Applied', tabBarIcon: icon('briefcase') }} />
        <Tabs.Screen name="saved" options={{ title: 'Saved', tabBarIcon: icon('bookmark') }} />
        <Tabs.Screen
          name="notifications"
          options={{ title: 'Alerts', tabBarBadge: unread > 0 ? (unread > 9 ? '9+' : unread) : undefined, tabBarIcon: icon('notifications') }}
        />
        <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: icon('person-circle') }} />
      </Tabs>
    </>
  );
}

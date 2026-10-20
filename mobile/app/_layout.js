import '../global.css';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '../store/auth';

// Auth gate: redirects between (auth) and (tabs) based on session + onboarding state
function AuthGate({ children }) {
  const { user, booting } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (booting) return;
    const inAuth = segments[0] === '(auth)';
    const needsOnboarding = user && !user.onboarded && user.role === 'candidate';

    if (!user && !inAuth) router.replace('/welcome');
    else if (user && inAuth && !needsOnboarding) router.replace('/(tabs)');
    else if (needsOnboarding && segments[0] !== 'onboarding') router.replace('/onboarding');
  }, [user, booting, segments]);

  return children;
}

export default function RootLayout() {
  const bootstrap = useAuth((s) => s.bootstrap);
  const booting = useAuth((s) => s.booting);

  useEffect(() => {
    bootstrap();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        {booting ? (
          <View className="flex-1 items-center justify-center bg-brand-500">
            <MotiView
              from={{ scale: 0.92 }}
              animate={{ scale: 1.04 }}
              transition={{ type: 'timing', duration: 900, loop: true }}
              style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="briefcase" size={36} color="#2F6BFF" />
            </MotiView>
            <Text className="mt-5 text-2xl font-extrabold tracking-tight text-white">ApplyUp</Text>
            <ActivityIndicator className="mt-8" color="#fff" />
          </View>
        ) : (
          <AuthGate>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F5F7FB' }, animation: 'slide_from_right' }}>
              <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
              <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
              <Stack.Screen name="job/[id]" options={{ presentation: 'card' }} />
              <Stack.Screen name="edit-profile" options={{ presentation: 'modal' }} />
              <Stack.Screen name="change-password" options={{ presentation: 'modal' }} />
              <Stack.Screen name="proposal/[jobId]" options={{ presentation: 'modal' }} />
              <Stack.Screen name="portfolio" options={{ presentation: 'card' }} />
              <Stack.Screen name="portfolio-edit" options={{ presentation: 'modal' }} />
            </Stack>
          </AuthGate>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

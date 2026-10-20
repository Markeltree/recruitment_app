import { useCallback, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Animated, {
  Extrapolation,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AnimatedCounter from '../../components/AnimatedCounter';
import Avatar from '../../components/Avatar';
import PressableScale from '../../components/PressableScale';
import ProgressRing from '../../components/ProgressRing';
import { openLegalPage } from '../../components/LegalLinks';
import { WEBSITE_URL } from '../../constants/config';
import { userApi } from '../../lib/api';
import { shadow } from '../../constants/theme';
import { useAuth } from '../../store/auth';

const HEADER_HEIGHT = 300;

function Row({ icon, label, onPress, danger, value, last }) {
  return (
    <PressableScale onPress={onPress} scaleTo={0.98} className={`flex-row items-center py-3.5 ${last ? '' : 'border-b border-line'}`}>
      <View className={`mr-3 h-9 w-9 items-center justify-center rounded-xl ${danger ? 'bg-rose-50' : 'bg-ink-100'}`}>
        <Ionicons name={icon} size={17} color={danger ? '#E11D48' : '#334155'} />
      </View>
      <Text className={`flex-1 text-[15px] font-semibold ${danger ? 'text-danger' : 'text-ink-900'}`}>{label}</Text>
      {value ? <Text className="mr-2 max-w-[140px] text-sm capitalize text-ink-500" numberOfLines={1}>{value}</Text> : null}
      {!danger ? <Ionicons name="chevron-forward" size={17} color="#CBD5E1" /> : null}
    </PressableScale>
  );
}

function Group({ title, children, delay = 0 }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify().damping(16)} className="mt-6">
      <Text className="mb-2 ml-1 text-xs font-bold uppercase tracking-widest text-ink-400">{title}</Text>
      <View className="rounded-[22px] border border-line bg-white px-4" style={shadow.sm}>{children}</View>
    </Animated.View>
  );
}

function Stat({ label, value, divider }) {
  return (
    <View className={`flex-1 items-center ${divider ? 'border-l border-line' : ''}`}>
      <AnimatedCounter value={value} className="text-2xl font-extrabold tracking-tight text-ink-900" />
      <Text className="mt-0.5 text-xs font-medium text-ink-500">{label}</Text>
    </View>
  );
}

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const scrollY = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      userApi.stats().then(setStats).catch(() => {});
    }, [])
  );

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  // Gradient stretches on pull-down and drifts slower than content on scroll (parallax)
  const bgStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [-200, 0, 200], [-100, 0, 80], Extrapolation.CLAMP) },
      { scale: interpolate(scrollY.value, [-200, 0], [1.7, 1], Extrapolation.CLAMP) },
    ],
  }));
  const identityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 140], [1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(scrollY.value, [0, 140], [0, 30], Extrapolation.CLAMP) }],
  }));

  const confirmLogout = () =>
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);

  const confirmDelete = () =>
    Alert.alert('Delete account', 'This permanently deletes your account and applications.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await userApi.deleteAccount();
            logout();
          } catch (err) {
            Alert.alert('Could not delete account', err.message);
          }
        },
      },
    ]);

  // Profile strength: share of the key fields the user has filled in
  const fields = [user?.headline, user?.location, user?.phone, user?.bio, user?.skills?.length, user?.portfolio?.length];
  const completion = Math.round((fields.filter(Boolean).length / fields.length) * 100);

  return (
    <View className="flex-1 bg-background">
      <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, height: HEADER_HEIGHT + insets.top }, bgStyle]}>
        <LinearGradient colors={['#14286B', '#1F55E0', '#2F6BFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }} />
        <View pointerEvents="none" className="absolute -right-16 -top-10 h-56 w-56 rounded-full border border-white/10" />
        <View pointerEvents="none" className="absolute -left-10 top-28 h-32 w-32 rounded-full bg-white/5" />
      </Animated.View>

      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingTop: insets.top + 12, height: HEADER_HEIGHT + insets.top - 48 }}>
          <View className="flex-row items-center justify-between px-5">
            <Text className="text-lg font-bold text-white">Profile</Text>
            <PressableScale haptic onPress={() => router.push('/edit-profile')} className="flex-row items-center rounded-full bg-white/20 px-3 py-1.5">
              <Ionicons name="create-outline" size={15} color="#fff" />
              <Text className="ml-1 text-xs font-semibold text-white">Edit</Text>
            </PressableScale>
          </View>
          <Animated.View style={identityStyle} className="mt-5 items-center px-5">
            <Animated.View entering={FadeInDown.springify().damping(14)}>
              <Avatar name={user?.name} size={84} ring />
            </Animated.View>
            <Animated.Text entering={FadeInDown.delay(80).duration(400)} className="mt-3 text-[22px] font-extrabold tracking-tight text-white">
              {user?.name}
            </Animated.Text>
            <Text className="mt-1 text-sm text-white/80" numberOfLines={1}>{user?.headline || user?.email}</Text>
            <Animated.View entering={FadeInDown.delay(160).duration(400)} className="mt-3 flex-row gap-2">
              <View className="flex-row items-center rounded-full bg-white/15 px-2.5 py-1">
                <Ionicons name={user?.role === 'recruiter' ? 'business' : 'person'} size={11} color="#fff" />
                <Text className="ml-1 text-xs font-semibold capitalize text-white">{user?.role}</Text>
              </View>
              {user?.location ? (
                <View className="flex-row items-center rounded-full bg-white/15 px-2.5 py-1">
                  <Ionicons name="location" size={11} color="#fff" />
                  <Text className="ml-1 text-xs font-semibold text-white">{user.location}</Text>
                </View>
              ) : null}
            </Animated.View>
          </Animated.View>
        </View>

        <View className="rounded-t-[32px] bg-background px-5 pt-5">
          <Animated.View entering={FadeInDown.delay(120).springify().damping(16)} className="-mt-14 rounded-[22px] border border-line bg-white py-4" style={shadow.md}>
            <View className="flex-row">
              <Stat label="Applied" value={stats?.total ?? '—'} />
              <Stat label="Interviews" value={stats?.byStatus?.interview ?? 0} divider />
              <Stat label="Offers" value={stats?.byStatus?.offer ?? 0} divider />
            </View>
          </Animated.View>

          {completion < 100 ? (
            <Animated.View entering={FadeInDown.delay(180).springify().damping(16)}>
              <PressableScale
                onPress={() => router.push('/edit-profile')}
                scaleTo={0.98}
                className="mt-4 flex-row items-center rounded-[22px] border border-brand-100 bg-white p-4"
                style={shadow.sm}
              >
                <ProgressRing progress={completion / 100} size={58} stroke={6} delay={400} duration={1200}>
                  <Text className="text-[13px] font-extrabold text-brand-600">{completion}%</Text>
                </ProgressRing>
                <View className="ml-4 flex-1">
                  <Text className="text-[15px] font-bold text-ink-900">Boost your profile</Text>
                  <Text className="mt-0.5 text-xs leading-[18px] text-ink-500">Complete your profile so recruiters see the full picture.</Text>
                </View>
                <View className="h-8 w-8 items-center justify-center rounded-full bg-brand-50">
                  <Ionicons name="arrow-forward" size={15} color="#2F6BFF" />
                </View>
              </PressableScale>
            </Animated.View>
          ) : null}

          <Group title="Account" delay={240}>
            <Row icon="person-outline" label="Edit profile" onPress={() => router.push('/edit-profile')} />
            <Row icon="lock-closed-outline" label="Change password" onPress={() => router.push('/change-password')} last />
          </Group>

          <Group title="Job search" delay={300}>
            <Row icon="layers-outline" label="Portfolio" value={user?.portfolio?.length ? `${user.portfolio.length} projects` : 'Add projects'} onPress={() => router.push('/portfolio')} />
            <Row icon="options-outline" label="Job preferences" value={user?.preferences?.jobTypes?.join(', ') || 'Set up'} onPress={() => router.push('/onboarding')} last />
          </Group>

          {WEBSITE_URL ? (
            <Group title="About" delay={330}>
              <Row icon="shield-checkmark-outline" label="Privacy policy" onPress={() => openLegalPage('/privacy')} />
              <Row icon="document-text-outline" label="Terms of service" onPress={() => openLegalPage('/terms')} last />
            </Group>
          ) : null}

          <Group title="Session" delay={360}>
            <Row icon="log-out-outline" label="Sign out" onPress={confirmLogout} />
            <Row icon="trash-outline" label="Delete account" danger onPress={confirmDelete} last />
          </Group>

          <Text className="mt-8 text-center text-xs text-ink-400">ApplyUp · v1.0.0</Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

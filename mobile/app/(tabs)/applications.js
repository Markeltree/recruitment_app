import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Animated, { Easing, FadeInDown, FadeOutLeft, LinearTransition, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import CompanyLogo from '../../components/CompanyLogo';
import EmptyState from '../../components/EmptyState';
import PressableScale from '../../components/PressableScale';
import { useScrollHeader } from '../../components/ScreenHeader';
import StatTile from '../../components/StatTile';
import TabHero, { HeroCompactBar } from '../../components/TabHero';
import StatusBadge from '../../components/StatusBadge';
import { ListSkeleton } from '../../components/Skeleton';
import { applicationsApi } from '../../lib/api';
import { shadow, statusMeta, timeAgo } from '../../constants/theme';

const FILTERS = ['all', 'applied', 'reviewing', 'interview', 'offer', 'rejected'];
const STAGES = ['Applied', 'Reviewing', 'Interview', 'Offer'];

// One pipeline segment that fills left-to-right after `delay`
function Segment({ filled, color, delay }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, withTiming(filled ? 1 : 0, { duration: 420, easing: Easing.out(Easing.cubic) }));
  }, [filled, color]);
  const style = useAnimatedStyle(() => ({ width: `${p.value * 100}%` }));
  return (
    <View className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
      <Animated.View style={[{ height: '100%', borderRadius: 999, backgroundColor: color }, style]} />
    </View>
  );
}

// Four-segment pipeline bar; closed applications (rejected/withdrawn) render muted
function Progress({ status, baseDelay }) {
  const meta = statusMeta[status] || statusMeta.applied;
  const closed = meta.step === 0;
  return (
    <View className="mt-4">
      <View className="flex-row gap-1.5">
        {STAGES.map((s, i) => (
          <Segment key={s} filled={closed ? i === 0 : i < meta.step} color={meta.dot} delay={baseDelay + i * 140} />
        ))}
      </View>
      <View className="mt-1.5 flex-row">
        {STAGES.map((s, i) => (
          <Text key={s} className={`flex-1 text-[10px] font-semibold ${!closed && i < meta.step ? 'text-ink-700' : 'text-ink-400'}`}>
            {s}
          </Text>
        ))}
      </View>
    </View>
  );
}

export default function Applications() {
  const router = useRouter();
  const { scrollY, onScroll } = useScrollHeader();
  const [apps, setApps] = useState([]);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      setApps(await applicationsApi.mine());
    } finally {
      setRefreshing(false);
      setLoaded(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const visible = useMemo(() => (filter === 'all' ? apps : apps.filter((a) => a.status === filter)), [apps, filter]);

  const counts = useMemo(() => {
    const c = { all: apps.length };
    apps.forEach((a) => (c[a.status] = (c[a.status] || 0) + 1));
    return c;
  }, [apps]);
  const active = (counts.applied || 0) + (counts.reviewing || 0) + (counts.interview || 0);

  const withdraw = async (id) => {
    // Optimistic: flip the status so the card animates to its new state immediately
    setApps((prev) => prev.map((a) => (a._id === id ? { ...a, status: 'withdrawn' } : a)));
    try {
      await applicationsApi.withdraw(id);
    } catch {
      /* reload below restores the real status */
    } finally {
      load();
    }
  };

  const header = (
    <>
      <TabHero
        scrollY={scrollY}
        eyebrow="Your pipeline"
        title="Applications"
        subtitle={apps.length ? `${apps.length} total · ${active} active` : 'Track every role you apply to'}
        overlap={apps.length ? 56 : 0}
      />
      {apps.length ? (
        <View className="-mt-14 flex-row gap-3 px-5">
          <StatTile delay={60} icon="pulse" color="#2F6BFF" bg="#EEF4FF" value={active} label="In progress" />
          <StatTile delay={120} icon="chatbubbles" color="#7C3AED" bg="#F5F3FF" value={counts.interview || 0} label="Interviews" />
          <StatTile delay={180} icon="trophy" color="#16A34A" bg="#F0FDF4" value={counts.offer || 0} label="Offers" />
        </View>
      ) : null}
      {loaded ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16, gap: 8 }}>
          {FILTERS.map((f) => (
            <Chip key={f} label={f === 'all' ? 'All' : statusMeta[f].label} count={counts[f] || 0} selected={filter === f} onPress={() => setFilter(f)} />
          ))}
        </ScrollView>
      ) : null}
    </>
  );

  return (
    <View className="flex-1 bg-background">
      <HeroCompactBar title="Applications" scrollY={scrollY} />
      <Animated.FlatList
        data={visible}
        keyExtractor={(a) => a._id}
        onScroll={onScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={header}
        contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
        itemLayoutAnimation={LinearTransition.springify().damping(18)}
        refreshControl={<RefreshControl refreshing={refreshing && loaded} onRefresh={load} tintColor="#2F6BFF" />}
        ListEmptyComponent={
          !loaded ? (
            <ListSkeleton />
          ) : apps.length ? (
            <EmptyState icon="filter-outline" title="Nothing here" subtitle={`No applications with status "${statusMeta[filter]?.label}".`} />
          ) : (
            <EmptyState icon="briefcase-outline" title="No applications yet" subtitle="Swipe through Discover and apply to roles you love.">
              <Button title="Explore jobs" onPress={() => router.push('/(tabs)')} icon={<Ionicons name="compass" size={18} color="#fff" />} />
            </EmptyState>
          )
        }
        renderItem={({ item, index }) => (
          <Animated.View
            key={`${filter}-${item._id}`}
            entering={FadeInDown.delay(Math.min(index, 8) * 60)
              .springify()
              .damping(16)}
            exiting={FadeOutLeft.duration(220)}
            className="px-5"
          >
            <PressableScale
              onPress={() => router.push(`/job/${item.job?._id}`)}
              scaleTo={0.975}
              className="mb-3 rounded-[22px] border border-line bg-white p-4"
              style={shadow.sm}
            >
              <View className="flex-row items-center">
                <CompanyLogo name={item.job?.company || '?'} uri={item.job?.companyLogo} size={44} />
                <View className="ml-3 flex-1 pr-2">
                  <Text className="text-base font-bold text-ink-900" numberOfLines={1}>
                    {item.job?.title || 'Job removed'}
                  </Text>
                  <Text className="mt-0.5 text-sm text-ink-500" numberOfLines={1}>
                    {item.job?.company}
                  </Text>
                </View>
                <Animated.View key={item.status} entering={FadeInDown.springify()}>
                  <StatusBadge status={item.status} />
                </Animated.View>
              </View>

              <Progress status={item.status} baseDelay={200 + Math.min(index, 8) * 60} />

              <View className="mt-4 flex-row items-center justify-between border-t border-line pt-3">
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={14} color="#94A3B8" />
                  <Text className="ml-1 text-xs font-medium text-ink-500">Applied {timeAgo(item.createdAt)}</Text>
                </View>
                {['applied', 'reviewing'].includes(item.status) ? (
                  <Pressable onPress={() => withdraw(item._id)} hitSlop={8} className="rounded-full border border-rose-200 px-3 py-1 active:bg-rose-50">
                    <Text className="text-xs font-semibold text-danger">Withdraw</Text>
                  </Pressable>
                ) : null}
              </View>
            </PressableScale>
          </Animated.View>
        )}
      />
    </View>
  );
}

import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeOutLeft, LinearTransition } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import JobCard from '../../components/JobCard';
import EmptyState from '../../components/EmptyState';
import { useScrollHeader } from '../../components/ScreenHeader';
import StatTile from '../../components/StatTile';
import TabHero, { HeroCompactBar } from '../../components/TabHero';
import { ListSkeleton } from '../../components/Skeleton';
import { swipesApi } from '../../lib/api';

export default function Saved() {
  const router = useRouter();
  const { scrollY, onScroll } = useScrollHeader();
  const [jobs, setJobs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      setJobs(await swipesApi.saved());
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

  const summary = useMemo(
    () => ({
      remote: jobs.filter((j) => j.workMode === 'remote').length,
      fullTime: jobs.filter((j) => j.type === 'full-time').length,
    }),
    [jobs],
  );

  return (
    <View className="flex-1 bg-background">
      <HeroCompactBar title="Saved jobs" scrollY={scrollY} />
      <Animated.FlatList
        data={jobs}
        keyExtractor={(j) => j._id}
        onScroll={onScroll}
        scrollEventThrottle={16}
        itemLayoutAnimation={LinearTransition.springify().damping(18)}
        ListHeaderComponent={
          <View className="mb-4">
            <TabHero
              scrollY={scrollY}
              eyebrow="Shortlist"
              title="Saved jobs"
              subtitle={jobs.length ? `${jobs.length} ${jobs.length === 1 ? 'role' : 'roles'} waiting for your next move` : 'Your shortlist lives here'}
              overlap={jobs.length ? 56 : 0}
            />
            {jobs.length ? (
              <View className="-mt-14 flex-row gap-3 px-5">
                <StatTile delay={60} icon="bookmark" color="#2F6BFF" bg="#EEF4FF" value={jobs.length} label="Saved" />
                <StatTile delay={120} icon="globe" color="#0891B2" bg="#ECFEFF" value={summary.remote} label="Remote" />
                <StatTile delay={180} icon="briefcase" color="#7C3AED" bg="#F5F3FF" value={summary.fullTime} label="Full-time" />
              </View>
            ) : null}
          </View>
        }
        contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing && loaded} onRefresh={load} tintColor="#2F6BFF" />}
        ListEmptyComponent={
          !loaded ? (
            <ListSkeleton />
          ) : (
            <EmptyState icon="bookmark-outline" title="Nothing saved yet" subtitle="Swipe right or tap the bookmark on a job in Discover to keep it here.">
              <Button title="Explore jobs" onPress={() => router.push('/(tabs)')} icon={<Ionicons name="compass" size={18} color="#fff" />} />
            </EmptyState>
          )
        }
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(Math.min(index, 8) * 60)
              .springify()
              .damping(16)}
            exiting={FadeOutLeft.duration(200)}
            className="px-5"
          >
            <JobCard job={item} onPress={() => router.push(`/job/${item._id}`)} />
          </Animated.View>
        )}
      />
    </View>
  );
}

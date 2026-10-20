import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Animated, {
  Extrapolation,
  FadeIn,
  FadeInDown,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import SwipeDeck, { SWIPE_THRESHOLD } from '../../components/SwipeDeck';
import EmptyState from '../../components/EmptyState';
import AnimatedCounter from '../../components/AnimatedCounter';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import IconButton from '../../components/IconButton';
import PressableScale from '../../components/PressableScale';
import Skeleton from '../../components/Skeleton';
import TabHero from '../../components/TabHero';
import Toast, { useToast } from '../../components/Toast';
import { jobsApi, swipesApi, userApi } from '../../lib/api';
import { shadow } from '../../constants/theme';
import { useAuth } from '../../store/auth';
import { useNotifications } from '../../store/notifications';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Round deck action. When `side` is set (1 = right/save, -1 = left/pass) the button grows and
 * fills with `color` as the top card is dragged toward that side.
 */
function ActionButton({ icon, color, size = 60, onPress, label, filled, dragX, side, disabled }) {
  const press = useSharedValue(1);

  const style = useAnimatedStyle(() => {
    const v = side && dragX ? side * dragX.value : 0;
    const grow = interpolate(v, [0, SWIPE_THRESHOLD], [1, 1.16], Extrapolation.CLAMP);
    const bg = filled ? '#2F6BFF' : interpolateColor(Math.min(Math.max(v / SWIPE_THRESHOLD, 0), 1), [0, 1], ['#FFFFFF', color]);
    return { transform: [{ scale: press.value * grow }], backgroundColor: bg };
  });
  const whiteIcon = useAnimatedStyle(() => {
    const v = side && dragX ? side * dragX.value : 0;
    return { opacity: filled ? 1 : interpolate(v, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP) };
  });

  return (
    <View className="items-center">
      <AnimatedPressable
        accessibilityLabel={label}
        disabled={disabled}
        onPressIn={() => (press.value = withSpring(0.86, { damping: 18, stiffness: 400 }))}
        onPressOut={() => (press.value = withSpring(1, { damping: 10, stiffness: 260 }))}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          onPress?.();
        }}
        className={`items-center justify-center rounded-full ${filled ? '' : 'border border-line'} ${disabled ? 'opacity-40' : ''}`}
        style={[{ width: size, height: size }, filled ? shadow.brand : shadow.md, style]}
      >
        {!filled ? <Ionicons name={icon} size={size * 0.42} color={color} /> : null}
        <Animated.View style={[{ position: 'absolute' }, whiteIcon]}>
          <Ionicons name={icon} size={size * 0.42} color="#fff" />
        </Animated.View>
      </AnimatedPressable>
      <Text className="mt-1.5 text-[11px] font-semibold text-ink-500">{label}</Text>
    </View>
  );
}

// Placeholder shaped like a swipe card while the feed loads
function DeckSkeleton() {
  return (
    <Animated.View entering={FadeIn} className="flex-1 rounded-[28px] border border-line bg-white p-6" style={{ maxHeight: 560 }}>
      <View className="flex-row items-center">
        <Skeleton width={52} height={52} radius={14} />
        <View className="ml-3 flex-1">
          <Skeleton width="50%" />
          <Skeleton width="30%" height={10} style={{ marginTop: 8 }} />
        </View>
      </View>
      <Skeleton width="85%" height={26} style={{ marginTop: 24 }} />
      <Skeleton width="60%" height={26} style={{ marginTop: 8 }} />
      <View className="mt-4 flex-row">
        <Skeleton width={80} />
        <Skeleton width={80} style={{ marginLeft: 12 }} />
        <Skeleton width={70} style={{ marginLeft: 12 }} />
      </View>
      <Skeleton height={60} radius={16} style={{ marginTop: 16 }} />
      <View className="mt-6">
        <Skeleton />
        <Skeleton style={{ marginTop: 10 }} />
        <Skeleton width="70%" style={{ marginTop: 10 }} />
      </View>
    </Animated.View>
  );
}

// Tappable stat pill on the hero
function HeroStat({ icon, value, label, onPress, delay }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify().damping(16)} className="flex-1">
      <PressableScale haptic onPress={onPress} scaleTo={0.95} className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2.5">
        <View className="flex-row items-center">
          <Ionicons name={icon} size={13} color="rgba(255,255,255,0.75)" />
          <Text className="ml-1 text-[11px] font-semibold text-white/75" numberOfLines={1}>
            {label}
          </Text>
        </View>
        <AnimatedCounter value={value} className="mt-0.5 text-xl font-extrabold text-white" />
      </PressableScale>
    </Animated.View>
  );
}

function CategoryChip({ label, active, onPress }) {
  return (
    <PressableScale haptic onPress={onPress} scaleTo={0.94}>
      <View className={`rounded-full border px-4 py-2 ${active ? 'border-white bg-white' : 'border-white/20 bg-white/10'}`}>
        <Text className={`text-[13px] font-bold ${active ? 'text-brand-700' : 'text-white'}`}>{label}</Text>
      </View>
    </PressableScale>
  );
}

export default function Discover() {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const user = useAuth((s) => s.user);
  const unread = useNotifications((s) => s.unread);
  const deckRef = useRef(null);
  const swiped = useRef(new Set());
  const dragX = useSharedValue(0);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [category, setCategory] = useState('all');
  const [deckVersion, setDeckVersion] = useState(0);
  const [counts, setCounts] = useState({ saved: 0, applied: 0 });
  const [toast, showToast] = useToast();

  // Stat pills are skipped on short screens so the card keeps enough room
  const showStats = height >= 740;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await jobsApi.feed();
      swiped.current = new Set();
      setJobs(data);
      setCategory('all');
      setDeckVersion((v) => v + 1);
      setEmpty(data.length === 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Refresh the hero counters whenever the tab regains focus
  useFocusEffect(
    useCallback(() => {
      Promise.all([swipesApi.saved().catch(() => null), userApi.stats().catch(() => null)]).then(([saved, stats]) => {
        setCounts((c) => ({ saved: saved ? saved.length : c.saved, applied: stats ? stats.total : c.applied }));
      });
    }, []),
  );

  const categories = useMemo(() => [...new Set(jobs.map((j) => j.category).filter(Boolean))], [jobs]);

  // The deck list is frozen per filter/version so swiping doesn't reshuffle it; already-swiped
  // jobs are left out when the user switches category.
  const deckJobs = useMemo(
    () => jobs.filter((j) => !swiped.current.has(j._id) && (category === 'all' || j.category === category)),
    [jobs, category, deckVersion],
  );
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    setRemaining(deckJobs.length);
    setEmpty(deckJobs.length === 0);
  }, [deckJobs]);

  const pickCategory = (c) => {
    if (c === category) return;
    setLastAction(null);
    setCategory(c);
  };

  const handleSwipe = async (job, direction) => {
    Haptics.impactAsync(direction === 'like' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    swiped.current.add(job._id);
    setLastAction({ job, direction });
    setRemaining((r) => Math.max(0, r - 1));
    if (direction === 'like') setCounts((c) => ({ ...c, saved: c.saved + 1 }));
    showToast(
      direction === 'like' ? { text: 'Saved to your shortlist', icon: 'bookmark', color: '#2F6BFF' } : { text: 'Passed', icon: 'close', color: '#64748B' },
    );
    try {
      // 'like' from the deck means "interested" — the job is saved; applying happens on the detail screen
      await swipesApi.record(job._id, direction === 'like' ? 'save' : 'pass');
    } catch {
      /* swipe is optimistic; a failure is not blocking */
    }
  };

  const undo = async () => {
    if (!lastAction) return;
    await swipesApi.undo(lastAction.job._id).catch(() => {});
    swiped.current.delete(lastAction.job._id);
    if (lastAction.direction === 'like') setCounts((c) => ({ ...c, saved: Math.max(0, c.saved - 1) }));
    setLastAction(null);
    setEmpty(false);
    setRemaining((r) => r + 1);
    deckRef.current?.undo();
    showToast({ text: 'Brought it back', icon: 'arrow-undo', color: '#F59E0B' });
  };

  // Screen background picks up a faint tint of the swipe direction
  const glow = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(dragX.value, [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD], ['#FFF1F3', '#F5F7FB', '#EAF1FF']),
  }));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0];

  return (
    <Animated.View style={[{ flex: 1 }, glow]}>
      <TabHero>
        <Animated.View entering={FadeInDown.duration(400)} className="flex-row items-center px-5">
          <Pressable onPress={() => router.push('/(tabs)/profile')} accessibilityLabel="Open profile">
            <Avatar name={user?.name} size={46} ring />
          </Pressable>
          <View className="ml-3 flex-1">
            <Text className="text-[13px] font-medium text-white/70">{greeting} 👋</Text>
            <Text className="text-[22px] font-extrabold tracking-tight text-white" numberOfLines={1}>
              {firstName}
            </Text>
          </View>
          <IconButton icon="notifications-outline" variant="glass" label="Alerts" dot={unread > 0} onPress={() => router.push('/(tabs)/notifications')} />
        </Animated.View>

        {showStats ? (
          <View className="mt-4 flex-row gap-2.5 px-5">
            <HeroStat delay={80} icon="flame" value={loading ? '—' : remaining} label="Picks left" />
            <HeroStat delay={140} icon="bookmark" value={counts.saved} label="Saved" onPress={() => router.push('/(tabs)/saved')} />
            <HeroStat delay={200} icon="briefcase" value={counts.applied} label="Applied" onPress={() => router.push('/(tabs)/applications')} />
          </View>
        ) : null}

        {categories.length > 1 ? (
          <Animated.View entering={FadeInDown.delay(260).duration(400)}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, gap: 8 }}>
              <CategoryChip label="For you" active={category === 'all'} onPress={() => pickCategory('all')} />
              {categories.map((c) => (
                <CategoryChip key={c} label={c} active={category === c} onPress={() => pickCategory(c)} />
              ))}
            </ScrollView>
          </Animated.View>
        ) : null}
      </TabHero>

      <View className="flex-1 px-5 pb-3 pt-4">
        {loading ? (
          <DeckSkeleton />
        ) : empty ? (
          category !== 'all' ? (
            <EmptyState icon="funnel-outline" title={`No more ${category} roles`} subtitle="You've gone through everything in this category for now.">
              <Button title="Show all roles" onPress={() => pickCategory('all')} icon={<Ionicons name="apps" size={18} color="#fff" />} />
            </EmptyState>
          ) : (
            <EmptyState
              icon="checkmark-done-outline"
              title="You're all caught up"
              subtitle="New roles are posted daily. Check back soon or widen your preferences."
            >
              <Button title="Refresh feed" onPress={load} icon={<Ionicons name="refresh" size={18} color="#fff" />} />
              <Button title="Edit preferences" variant="ghost" className="mt-2" onPress={() => router.push('/onboarding')} />
            </EmptyState>
          )
        ) : (
          <>
            <View className="flex-1">
              <SwipeDeck
                key={`${category}-${deckVersion}`}
                ref={deckRef}
                jobs={deckJobs}
                dragX={dragX}
                onSwipe={handleSwipe}
                onEmpty={() => setEmpty(true)}
                onOpen={(job) => router.push(`/job/${job._id}`)}
              />
            </View>

            <Animated.View entering={FadeInDown.delay(250).springify().damping(16)} className="flex-row items-end justify-center gap-6 pt-5">
              <ActionButton icon="arrow-undo" color="#F59E0B" size={48} label="Undo" disabled={!lastAction} onPress={undo} />
              <ActionButton icon="close" color="#E11D48" label="Pass" side={-1} dragX={dragX} onPress={() => deckRef.current?.swipe('pass')} />
              <ActionButton icon="bookmark" color="#2F6BFF" label="Save" side={1} dragX={dragX} onPress={() => deckRef.current?.swipe('like')} />
              <ActionButton
                icon="paper-plane"
                filled
                size={48}
                label="Apply"
                onPress={() => {
                  const job = deckRef.current?.current();
                  if (job) router.push(`/job/${job._id}`);
                }}
              />
            </Animated.View>
          </>
        )}
      </View>
      <Toast toast={toast} bottom={110} />
    </Animated.View>
  );
}

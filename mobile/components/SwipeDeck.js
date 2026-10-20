import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  FadeInDown,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import CompanyLogo from './CompanyLogo';
import { formatSalary, shadow, timeAgo } from '../constants/theme';

const { width } = Dimensions.get('window');
export const SWIPE_THRESHOLD = width * 0.28;
const EXIT_DURATION = 260;
const STACK_OFFSET = 14;
const STACK_SCALE = 0.05;

const tick = () => Haptics.selectionAsync().catch(() => {});

function Meta({ icon, label }) {
  if (!label) return null;
  return (
    <View className="mb-2 mr-4 flex-row items-center">
      <Ionicons name={icon} size={15} color="#64748B" />
      <Text className="ml-1.5 text-sm font-medium capitalize text-ink-700">{label}</Text>
    </View>
  );
}

function SkillTag({ label }) {
  return (
    <View className="mb-2 mr-2 rounded-lg border border-line bg-canvas px-2.5 py-1.5">
      <Text className="text-xs font-semibold text-ink-700">{label}</Text>
    </View>
  );
}

/**
 * One card in the stack. The top card responds to drags AND to programmatic
 * commands from the deck (button presses), so both paths share the same exit animation.
 * The top card mirrors its x offset into `dragX`; cards behind use it to rise into place.
 */
function SwipeCard({ job, isTop, depth, onSwiped, command, commandDir, dragX }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const crossed = useSharedValue(0);

  // Share this card's drag with the rest of the deck (and the action buttons)
  useAnimatedReaction(
    () => translateX.value,
    (v) => {
      if (isTop) dragX.value = v;
    },
    [isTop]
  );

  // Button-driven swipes: when the deck bumps `command`, animate this card out.
  useAnimatedReaction(
    () => command.value,
    (current, previous) => {
      if (!isTop || current === previous || previous === null) return;
      const dir = commandDir.value;
      translateY.value = withTiming(-30, { duration: EXIT_DURATION });
      translateX.value = withTiming(dir * width * 1.5, { duration: EXIT_DURATION }, (finished) => {
        if (finished) runOnJS(onSwiped)(dir > 0 ? 'like' : 'pass');
      });
    },
    [isTop]
  );

  const pan = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.25;
      // Light haptic tick each time the drag crosses the decision threshold
      const side = e.translationX > SWIPE_THRESHOLD ? 1 : e.translationX < -SWIPE_THRESHOLD ? -1 : 0;
      if (side !== crossed.value) {
        crossed.value = side;
        if (side !== 0) runOnJS(tick)();
      }
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD || e.velocityX > 900) {
        translateX.value = withTiming(width * 1.5, { duration: EXIT_DURATION }, (finished) => {
          if (finished) runOnJS(onSwiped)('like');
        });
      } else if (e.translationX < -SWIPE_THRESHOLD || e.velocityX < -900) {
        translateX.value = withTiming(-width * 1.5, { duration: EXIT_DURATION }, (finished) => {
          if (finished) runOnJS(onSwiped)('pass');
        });
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 170 });
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    if (isTop) {
      const rotate = interpolate(translateX.value, [-width, 0, width], [-12, 0, 12], Extrapolation.CLAMP);
      return {
        opacity: 1,
        transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { rotate: `${rotate}deg` }, { scale: 1 }],
      };
    }
    // Cards behind move up one slot as the top card is dragged away
    const progress = Math.min(Math.abs(dragX.value) / SWIPE_THRESHOLD, 1);
    const d = depth - progress;
    return {
      opacity: interpolate(d, [1, 2], [1, 0.55], Extrapolation.CLAMP),
      transform: [{ translateX: 0 }, { translateY: d * STACK_OFFSET }, { rotate: '0deg' }, { scale: 1 - d * STACK_SCALE }],
    };
  });

  // Cards behind the top one keep their content hidden (it otherwise ghosts through the top
  // card on Android); the next card's content fades in as the top card is dragged away.
  const contentStyle = useAnimatedStyle(() => {
    if (isTop) return { opacity: 1 };
    if (depth > 1) return { opacity: 0 };
    return { opacity: Math.min(Math.abs(dragX.value) / SWIPE_THRESHOLD, 1) };
  });

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD * 0.8], [0, 1], Extrapolation.CLAMP),
    transform: [{ rotate: '-12deg' }, { scale: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0.6, 1], Extrapolation.CLAMP) }],
  }));
  const passStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, -SWIPE_THRESHOLD * 0.8], [0, 1], Extrapolation.CLAMP),
    transform: [{ rotate: '12deg' }, { scale: interpolate(translateX.value, [0, -SWIPE_THRESHOLD], [0.6, 1], Extrapolation.CLAMP) }],
  }));
  // Soft colour wash over the whole card in the swipe direction
  const likeTint = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 0.07], Extrapolation.CLAMP),
  }));
  const passTint = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, -SWIPE_THRESHOLD], [0, 0.07], Extrapolation.CLAMP),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[{ position: 'absolute', width: width - 40, height: '100%', zIndex: 10 - depth }, cardStyle]}>
        <View className="flex-1 overflow-hidden rounded-[28px] border border-line bg-white" style={shadow.lg}>
          <Animated.View pointerEvents="none" style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#2F6BFF', zIndex: 5 }, likeTint]} />
          <Animated.View pointerEvents="none" style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#E11D48', zIndex: 5 }, passTint]} />

          {/* Swipe stamps */}
          <Animated.View
            style={likeStyle}
            className="absolute left-5 top-6 z-10 flex-row items-center rounded-2xl border-[3px] border-brand-500 bg-white px-3 py-1.5"
          >
            <Ionicons name="bookmark" size={18} color="#2F6BFF" />
            <Text className="ml-1.5 text-xl font-extrabold tracking-widest text-brand-500">SAVE</Text>
          </Animated.View>
          <Animated.View
            style={passStyle}
            className="absolute right-5 top-6 z-10 flex-row items-center rounded-2xl border-[3px] border-danger bg-white px-3 py-1.5"
          >
            <Ionicons name="close" size={20} color="#E11D48" />
            <Text className="ml-1 text-xl font-extrabold tracking-widest text-danger">PASS</Text>
          </Animated.View>

          <Animated.View className="flex-1" style={contentStyle}>
          <View className="px-6 pt-6">
            <View className="flex-row items-center">
              <CompanyLogo name={job.company} uri={job.companyLogo} size={52} />
              <View className="ml-3 flex-1">
                <Text className="text-[15px] font-semibold text-ink-900" numberOfLines={1}>{job.company}</Text>
                <Text className="mt-0.5 text-xs text-ink-500">{job.createdAt ? `Posted ${timeAgo(job.createdAt)}` : 'Actively hiring'}</Text>
              </View>
              {job.matchScore ? (
                <View className="flex-row items-center rounded-full bg-green-50 px-2.5 py-1.5">
                  <Ionicons name="sparkles" size={12} color="#16A34A" />
                  <Text className="ml-1 text-xs font-bold text-green-700">{job.matchScore}% match</Text>
                </View>
              ) : null}
            </View>

            <Text className="mt-5 text-[26px] font-bold leading-8 tracking-tight text-ink-900" numberOfLines={2}>{job.title}</Text>

            <View className="mt-3 flex-row flex-wrap">
              <Meta icon="location-outline" label={job.location} />
              <Meta icon="briefcase-outline" label={job.type} />
              <Meta icon="globe-outline" label={job.workMode} />
              {job.experienceYears ? <Meta icon="trending-up-outline" label={`${job.experienceYears}+ yrs`} /> : null}
            </View>

            <View className="mt-3 flex-row items-center rounded-2xl bg-brand-50 px-4 py-3">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-white">
                <Ionicons name="cash-outline" size={18} color="#2F6BFF" />
              </View>
              <View className="ml-3">
                <Text className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">Compensation</Text>
                <Text className="text-base font-bold text-ink-900">{formatSalary(job.salaryMin, job.salaryMax, job.currency)}</Text>
              </View>
            </View>
          </View>

          <View className="mx-6 mt-5 h-px bg-line" />

          <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false} nestedScrollEnabled>
            <Text className="mb-2 text-xs font-bold uppercase tracking-widest text-ink-400">About the role</Text>
            <Text className="text-[15px] leading-6 text-ink-700" numberOfLines={6}>{job.description}</Text>
            {job.skills?.length ? (
              <>
                <Text className="mb-2 mt-5 text-xs font-bold uppercase tracking-widest text-ink-400">Skills</Text>
                <View className="flex-row flex-wrap">
                  {job.skills.map((s) => (
                    <SkillTag key={s} label={s} />
                  ))}
                </View>
              </>
            ) : null}
            <View className="h-6" />
          </ScrollView>

          <View className="flex-row items-center justify-center border-t border-line bg-canvas py-3">
            <Ionicons name="hand-left-outline" size={13} color="#64748B" />
            <Text className="ml-1.5 text-xs font-semibold text-ink-500">Swipe to decide · tap for details</Text>
          </View>
          </Animated.View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

/**
 * Swipeable deck. Parent drives it via ref: deck.swipe('like' | 'pass'), deck.undo(), deck.current().
 * props: jobs[], onSwipe(job, direction), onEmpty(), onOpen(job), dragX (optional shared value)
 */
const SwipeDeck = forwardRef(function SwipeDeck({ jobs, onSwipe, onEmpty, onOpen, dragX: externalDragX }, ref) {
  const [index, setIndex] = useState(0);
  const command = useSharedValue(0);
  const commandDir = useSharedValue(0);
  const internalDragX = useSharedValue(0);
  const dragX = externalDragX || internalDragX;

  const handled = (direction) => {
    const job = jobs[index];
    if (!job) return;
    onSwipe?.(job, direction);
    const next = index + 1;
    setIndex(next);
    if (next >= jobs.length) {
      dragX.value = 0;
      onEmpty?.();
    }
  };

  // Worklet callbacks can outlive a render; always call the latest handler through a ref
  const latest = useRef(handled);
  latest.current = handled;
  const stableSwiped = useCallback((direction) => latest.current(direction), []);

  useImperativeHandle(ref, () => ({
    swipe: (direction) => {
      if (!jobs[index]) return;
      commandDir.value = direction === 'like' ? 1 : -1;
      // Each bump is a new value so the top card's reaction fires
      command.value = command.value + 1;
    },
    // Step back one card (used by Undo); the previous card remounts fresh at rest
    undo: () => setIndex((i) => Math.max(0, i - 1)),
    reset: () => setIndex(0),
    // The job currently on top of the stack
    current: () => jobs[index],
  }));

  const visible = jobs.slice(index, index + 3);

  return (
    <View className="flex-1 items-center justify-center">
      <View className="w-full flex-1 items-center" style={{ maxHeight: 560 }}>
        {visible
          .map((job, depth) => (
            <Animated.View
              key={job._id}
              entering={FadeInDown.delay(depth * 90).springify().damping(16)}
              style={{ position: 'absolute', width: '100%', height: '100%', alignItems: 'center', zIndex: 10 - depth }}
            >
              <Pressable style={{ width: '100%', height: '100%', alignItems: 'center' }} onPress={depth === 0 ? () => onOpen?.(job) : undefined}>
                <SwipeCard
                  job={job}
                  isTop={depth === 0}
                  depth={depth}
                  command={command}
                  commandDir={commandDir}
                  dragX={dragX}
                  onSwiped={stableSwiped}
                />
              </Pressable>
            </Animated.View>
          ))
          .reverse()}
      </View>
    </View>
  );
});

export default SwipeDeck;

import { Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

// Scroll position + handler to drive the collapsing header
export function useScrollHeader() {
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  return { scrollY, onScroll };
}

/**
 * Large-title header used by the tab screens. With `scrollY` it fades/lifts as the list scrolls
 * and stretches slightly on pull-down.
 */
export default function ScreenHeader({ eyebrow, title, subtitle, right, scrollY }) {
  const animated = useAnimatedStyle(() => {
    if (!scrollY) return {};
    const y = scrollY.value;
    return {
      opacity: interpolate(y, [0, 56], [1, 0], Extrapolation.CLAMP),
      transform: [
        { translateY: interpolate(y, [0, 56], [0, -10], Extrapolation.CLAMP) },
        { scale: interpolate(y, [-120, 0], [1.08, 1], Extrapolation.CLAMP) },
      ],
    };
  });

  return (
    // Entering animation and scroll-driven transform live on separate layers so they don't fight
    <Animated.View entering={FadeInDown.duration(350)}>
      <Animated.View style={[{ transformOrigin: 'left center' }, animated]} className="flex-row items-end justify-between px-5 pb-4 pt-3">
        <View className="flex-1 pr-3">
          {eyebrow ? <Text className="mb-1 text-xs font-semibold uppercase tracking-widest text-brand-600">{eyebrow}</Text> : null}
          <Text className="text-[30px] font-extrabold tracking-tight text-ink-900">{title}</Text>
          {subtitle ? <Text className="mt-1 text-sm font-medium text-ink-500">{subtitle}</Text> : null}
        </View>
        {right}
      </Animated.View>
    </Animated.View>
  );
}

// Slim bar pinned to the top that fades in once the large title has scrolled away
export function CompactHeader({ title, scrollY, right }) {
  const bar = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [36, 72], [0, 1], Extrapolation.CLAMP),
  }));
  const label = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [36, 72], [10, 0], Extrapolation.CLAMP) }],
  }));

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[{ position: 'absolute', top: 0, left: 0, right: 0, height: 50, zIndex: 20 }, bar]}
      className="flex-row items-center justify-center border-b border-line bg-white/95"
    >
      <Animated.Text style={label} className="text-base font-bold text-ink-900">
        {title}
      </Animated.Text>
      {right ? <View className="absolute right-4">{right}</View> : null}
    </Animated.View>
  );
}

// Compact header for modal screens: left action, centered title, right action
export function ModalHeader({ title, left, right }) {
  return (
    <View className="flex-row items-center justify-between border-b border-line bg-white px-4 py-3">
      <View style={{ minWidth: 64 }} className="items-start">{left}</View>
      <Text className="text-base font-bold text-ink-900">{title}</Text>
      <View style={{ minWidth: 64 }} className="items-end">{right}</View>
    </View>
  );
}

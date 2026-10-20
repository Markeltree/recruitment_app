import { Text, View } from 'react-native';
import Animated, { Extrapolation, FadeInDown, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';

export const HERO_COLORS = ['#0F1E52', '#1A46BD', '#2F6BFF'];

/**
 * Gradient header for the tab screens. Draws under the status bar, has rounded bottom corners
 * and a slow-drifting light blob. `children` render below the title (chips, stats...).
 * `overlap` adds bottom padding so a card can sit half over the hero with a negative margin.
 * With `scrollY` the content drifts and fades as the list scrolls (parallax).
 */
export default function TabHero({ eyebrow, title, subtitle, right, children, scrollY, overlap = 0 }) {
  const insets = useSafeAreaInsets();

  const parallax = useAnimatedStyle(() => {
    if (!scrollY) return {};
    const y = scrollY.value;
    return {
      opacity: interpolate(y, [0, 110], [1, 0], Extrapolation.CLAMP),
      transform: [{ translateY: interpolate(y, [-150, 0, 150], [-30, 0, 45], Extrapolation.CLAMP) }],
    };
  });

  return (
    <View style={{ borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' }}>
      <LinearGradient colors={HERO_COLORS} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: insets.top + 10, paddingBottom: 20 + overlap }}>
        <MotiView
          pointerEvents="none"
          from={{ translateX: -10, translateY: 0 }}
          animate={{ translateX: 30, translateY: 20 }}
          transition={{ type: 'timing', duration: 6500, loop: true }}
          style={{ position: 'absolute', top: -80, right: -70, width: 230, height: 230, borderRadius: 115, backgroundColor: 'rgba(124,58,237,0.28)' }}
        />
        <View pointerEvents="none" className="absolute -left-16 bottom-[-60px] h-44 w-44 rounded-full border border-white/10" />
        <View pointerEvents="none" className="absolute right-10 top-16 h-24 w-24 rounded-full border border-white/10" />

        <Animated.View style={parallax}>
          {title ? (
            <Animated.View entering={FadeInDown.duration(400)} className="flex-row items-end px-5">
              <View className="flex-1 pr-3">
                {eyebrow ? <Text className="mb-1 text-xs font-bold uppercase tracking-widest text-white/60">{eyebrow}</Text> : null}
                <Text className="text-[30px] font-extrabold tracking-tight text-white">{title}</Text>
                {subtitle ? <Text className="mt-1 text-sm font-medium text-white/75">{subtitle}</Text> : null}
              </View>
              {right}
            </Animated.View>
          ) : null}
          {children}
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

// Dark bar pinned to the top that fades in once the hero has scrolled away
export function HeroCompactBar({ title, scrollY, right }) {
  const insets = useSafeAreaInsets();
  const bar = useAnimatedStyle(() => ({ opacity: interpolate(scrollY.value, [70, 120], [0, 1], Extrapolation.CLAMP) }));
  const label = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [70, 120], [10, 0], Extrapolation.CLAMP) }],
  }));

  return (
    <Animated.View pointerEvents="box-none" style={[{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }, bar]}>
      <LinearGradient colors={['#14286B', '#1F55E0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingTop: insets.top, height: insets.top + 50 }}>
        <View className="flex-1 flex-row items-center justify-center">
          <Animated.Text style={label} className="text-base font-bold text-white">
            {title}
          </Animated.Text>
          {right ? <View className="absolute right-4">{right}</View> : null}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

// Translucent pill for use on the hero (stats, filters, actions)
export function GlassPill({ children, active, className = '' }) {
  return (
    <View className={`flex-row items-center rounded-full border px-3.5 py-2 ${active ? 'border-white bg-white' : 'border-white/20 bg-white/10'} ${className}`}>
      {children}
    </View>
  );
}

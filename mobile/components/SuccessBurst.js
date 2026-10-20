import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  ZoomIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import ProgressRing from './ProgressRing';
import Button from './Button';

const PARTICLE_COLORS = ['#2F6BFF', '#16A34A', '#F59E0B', '#7C3AED', '#E11D48', '#06B6D4'];
const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  angle: (i / 14) * Math.PI * 2,
  distance: 70 + (i % 3) * 18,
  size: 6 + (i % 3) * 2,
  color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
}));

function Particle({ angle, distance, size, color }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(450, withTiming(1, { duration: 750, easing: Easing.out(Easing.cubic) }));
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 0.15, 1], [0, 1, 0]),
    transform: [
      { translateX: Math.cos(angle) * distance * t.value },
      { translateY: Math.sin(angle) * distance * t.value },
      { scale: interpolate(t.value, [0, 1], [1.2, 0.4]) },
    ],
  }));
  return <Animated.View style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]} />;
}

// Full-screen celebration shown after a successful application
export default function SuccessBurst({ title, subtitle, primary, secondary }) {
  return (
    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} className="absolute inset-0 z-50 items-center justify-center bg-ink-900/60 px-6">
      <Animated.View entering={ZoomIn.springify().damping(14)} className="w-full items-center rounded-[32px] bg-white px-6 pb-6 pt-10">
        <View className="items-center justify-center">
          {PARTICLES.map((p, i) => (
            <Particle key={i} {...p} />
          ))}
          <ProgressRing progress={1} size={96} stroke={6} color="#16A34A" track="#DCFCE7" duration={500}>
            <Animated.View entering={ZoomIn.delay(380).springify().damping(10)} className="h-16 w-16 items-center justify-center rounded-full bg-success">
              <Ionicons name="checkmark" size={36} color="#fff" />
            </Animated.View>
          </ProgressRing>
        </View>
        <Animated.Text entering={FadeInDown.delay(500).duration(400)} className="mt-6 text-center text-2xl font-bold tracking-tight text-ink-900">
          {title}
        </Animated.Text>
        <Animated.View entering={FadeInDown.delay(600).duration(400)}>
          <Text className="mt-2 text-center text-[15px] leading-[22px] text-ink-500">{subtitle}</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(700).duration(400)} className="mt-7 w-full gap-2">
          {primary ? <Button title={primary.title} onPress={primary.onPress} /> : null}
          {secondary ? <Button title={secondary.title} variant="ghost" onPress={secondary.onPress} /> : null}
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

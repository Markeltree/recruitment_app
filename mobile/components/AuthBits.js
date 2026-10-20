import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import PressableScale from './PressableScale';
import { shadow } from '../constants/theme';

/**
 * Two-option segmented control with a white pill that springs between options.
 * options: [{ key, label, icon, description }]
 */
export function SegmentedSwitch({ options, value, onChange }) {
  const [width, setWidth] = useState(0);
  const half = width / options.length;
  const x = useSharedValue(0);
  const index = Math.max(
    0,
    options.findIndex((o) => o.key === value),
  );

  useEffect(() => {
    if (half) x.value = withSpring(index * half, { damping: 18, stiffness: 200 });
  }, [index, half]);

  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const active = options[index];

  return (
    <View>
      <View className="flex-row rounded-2xl bg-ink-100 p-1" onLayout={(e) => setWidth(e.nativeEvent.layout.width - 8)}>
        {half ? (
          <Animated.View
            style={[{ position: 'absolute', top: 4, left: 4, bottom: 4, width: half, borderRadius: 12, backgroundColor: '#fff' }, shadow.sm, pill]}
          />
        ) : null}
        {options.map((o) => {
          const on = o.key === value;
          return (
            <PressableScale key={o.key} haptic scaleTo={0.97} onPress={() => onChange(o.key)} className="h-11 flex-1 flex-row items-center justify-center">
              <Ionicons name={o.icon} size={16} color={on ? '#1F55E0' : '#64748B'} />
              <Text className={`ml-1.5 text-sm font-bold ${on ? 'text-brand-700' : 'text-ink-500'}`}>{o.label}</Text>
            </PressableScale>
          );
        })}
      </View>
      {active?.description ? (
        <Animated.View key={active.key} entering={FadeInDown.duration(220)} exiting={FadeOut.duration(120)}>
          <Text className="mt-2 text-center text-xs text-ink-500">{active.description}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const LEVELS = [
  { label: 'Too short', color: '#E11D48' },
  { label: 'Weak', color: '#F97316' },
  { label: 'Fair', color: '#F59E0B' },
  { label: 'Good', color: '#2F6BFF' },
  { label: 'Strong', color: '#16A34A' },
];

// 0..4 - length plus character variety
export function passwordScore(pw) {
  if (!pw || pw.length < 6) return 0;
  let s = 1;
  if (pw.length >= 10) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}

function Segment({ on, color, delay }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withTiming(on ? 1 : 0, { duration: 260 + delay });
  }, [on]);
  const fill = useAnimatedStyle(() => ({ width: `${p.value * 100}%`, backgroundColor: color }));
  return (
    <View className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
      <Animated.View style={[{ height: '100%', borderRadius: 999 }, fill]} />
    </View>
  );
}

// Four-bar strength meter shown under the password field once the user starts typing
export function PasswordStrength({ password }) {
  if (!password) return null;
  const score = passwordScore(password);
  const level = LEVELS[score];
  return (
    <Animated.View entering={FadeIn.duration(200)} className="-mt-2 mb-4">
      <View className="flex-row gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <Segment key={i} on={score >= i} color={level.color} delay={i * 40} />
        ))}
      </View>
      <View className="mt-1.5 flex-row items-center justify-between">
        <Animated.Text key={level.label} entering={FadeInDown.duration(180)} className="text-xs font-bold" style={{ color: level.color }}>
          {level.label}
        </Animated.Text>
        {score < 4 ? <Text className="ml-3 flex-1 text-right text-[11px] text-ink-400">Try 10+ chars, Aa, 1 and a symbol</Text> : null}
      </View>
    </Animated.View>
  );
}

// Thin "or" divider
export function Divider({ label }) {
  return (
    <View className="my-6 flex-row items-center">
      <View className="h-px flex-1 bg-line" />
      <Text className="mx-3 text-xs font-semibold text-ink-400">{label}</Text>
      <View className="h-px flex-1 bg-line" />
    </View>
  );
}

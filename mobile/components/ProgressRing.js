import { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { Easing, useAnimatedProps, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Circular progress (0..1) that draws itself in. Children render in the center.
export default function ProgressRing({ progress, size = 56, stroke = 6, color = '#2F6BFF', track = '#E8ECF3', delay = 0, duration = 1000, children }) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = withDelay(delay, withTiming(progress, { duration, easing: Easing.out(Easing.cubic) }));
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: circumference * (1 - p.value) }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
        />
      </Svg>
      {children}
    </View>
  );
}

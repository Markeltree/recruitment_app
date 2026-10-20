import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Pressable that springs down on touch and back on release.
 * `haptic` fires a light selection tick on press.
 */
export default function PressableScale({ children, onPress, scaleTo = 0.96, haptic, style, className, disabled, ...rest }) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={() => (scale.value = withSpring(scaleTo, { damping: 20, stiffness: 400 }))}
      onPressOut={() => (scale.value = withSpring(1, { damping: 12, stiffness: 260 }))}
      onPress={(e) => {
        if (haptic) Haptics.selectionAsync().catch(() => {});
        onPress?.(e);
      }}
      style={[animated, style]}
      className={className}
    >
      {children}
    </AnimatedPressable>
  );
}

import { ActivityIndicator, Pressable, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { shadow } from '../constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const variants = {
  primary: { box: 'bg-brand-500', text: 'text-white', spinner: '#fff', shadow: shadow.brand },
  dark: { box: 'bg-ink-900', text: 'text-white', spinner: '#fff' },
  white: { box: 'bg-white', text: 'text-brand-700', spinner: '#2F6BFF', shadow: shadow.md },
  secondary: { box: 'bg-brand-50', text: 'text-brand-600', spinner: '#2F6BFF' },
  outline: { box: 'border border-line bg-white', text: 'text-ink-900', spinner: '#0B1220' },
  danger: { box: 'bg-danger', text: 'text-white', spinner: '#fff' },
  ghost: { box: 'bg-transparent', text: 'text-brand-600', spinner: '#2F6BFF' },
  glass: { box: 'border border-white/25 bg-white/10', text: 'text-white', spinner: '#fff' },
};

const sizes = {
  lg: { box: 'h-14 px-6', text: 'text-base' },
  md: { box: 'h-12 px-5', text: 'text-[15px]' },
  sm: { box: 'h-9 px-4', text: 'text-sm' },
};

export default function Button({ title, onPress, variant = 'primary', size = 'lg', loading, disabled, className = '', icon, iconRight }) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const v = variants[variant];
  const s = sizes[size];
  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      onPressIn={() => (scale.value = withSpring(0.97, { damping: 15 }))}
      onPressOut={() => (scale.value = withSpring(1, { damping: 15 }))}
      onPress={isDisabled ? undefined : onPress}
      style={[style, !isDisabled && v.shadow ? v.shadow : null]}
      className={`flex-row items-center justify-center rounded-2xl ${s.box} ${v.box} ${isDisabled ? 'opacity-50' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={v.spinner} />
      ) : (
        <>
          {icon && !iconRight ? icon : null}
          <Text className={`font-semibold ${s.text} ${v.text} ${icon ? (iconRight ? 'mr-2' : 'ml-2') : ''}`}>{title}</Text>
          {icon && iconRight ? icon : null}
        </>
      )}
    </AnimatedPressable>
  );
}

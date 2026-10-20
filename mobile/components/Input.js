import { forwardRef, useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, ZoomIn, interpolateColor, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const FOCUS_SHADOW = { borderWidth: 1.5, shadowColor: '#2F6BFF', shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0 };

// Text field with label, leading icon, password toggle, hint and error text.
// The border animates between idle/focus/error and the field shakes when an error appears.
// `success` shows a green check (e.g. matching passwords). The ref goes to the TextInput so
// forms can move focus to the next field.
const Input = forwardRef(function Input({ label, error, hint, secure, icon, multiline, success, className = '', onFocus, onBlur, ...props }, ref) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const focus = useSharedValue(0);
  const shake = useSharedValue(0);

  useEffect(() => {
    focus.value = withTiming(focused ? 1 : 0, { duration: 180 });
  }, [focused]);

  useEffect(() => {
    if (!error) return;
    shake.value = withSequence(
      withTiming(-7, { duration: 50 }),
      withTiming(7, { duration: 50 }),
      withTiming(-5, { duration: 50 }),
      withTiming(5, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  }, [error]);

  const boxStyle = useAnimatedStyle(() => ({
    borderColor: error ? '#E11D48' : success ? '#16A34A' : interpolateColor(focus.value, [0, 1], ['#E8ECF3', '#2F6BFF']),
    backgroundColor: error ? '#FFFFFF' : interpolateColor(focus.value, [0, 1], ['#F5F7FB', '#FFFFFF']),
    transform: [{ translateX: shake.value }],
    // Only the opacity animates; the static shadow shape lives in FOCUS_SHADOW
    shadowOpacity: error ? 0 : focus.value * 0.14,
  }));

  const iconColor = error ? '#E11D48' : success ? '#16A34A' : focused ? '#2F6BFF' : '#94A3B8';

  return (
    <View className={`mb-4 ${className}`}>
      {label ? <Text className={`mb-2 text-[13px] font-semibold ${focused ? 'text-brand-600' : 'text-ink-700'}`}>{label}</Text> : null}
      <Animated.View
        style={[FOCUS_SHADOW, boxStyle]}
        className={`flex-row rounded-2xl px-4 ${multiline ? 'min-h-[128px] items-start py-3' : 'h-14 items-center'}`}
      >
        {icon ? <Ionicons name={icon} size={18} color={iconColor} style={{ marginRight: 10, marginTop: multiline ? 2 : 0 }} /> : null}
        <TextInput
          ref={ref}
          placeholderTextColor="#94A3B8"
          secureTextEntry={secure && hidden}
          autoCapitalize="none"
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          className={`flex-1 text-base text-ink-900 ${multiline ? 'min-h-[100px]' : 'h-full'}`}
          {...props}
        />
        {success ? (
          <Animated.View entering={ZoomIn.springify().damping(10)} style={{ marginRight: secure ? 10 : 0 }}>
            <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
          </Animated.View>
        ) : null}
        {secure ? (
          <Pressable onPress={() => setHidden(!hidden)} hitSlop={10} accessibilityLabel={hidden ? 'Show password' : 'Hide password'}>
            <Animated.View key={String(hidden)} entering={FadeInDown.duration(150)}>
              <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color="#94A3B8" />
            </Animated.View>
          </Pressable>
        ) : null}
      </Animated.View>
      {error ? (
        <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOut.duration(150)} className="mt-1.5 flex-row items-center">
          <Ionicons name="alert-circle" size={13} color="#E11D48" />
          <Text className="ml-1 text-xs font-medium text-danger">{error}</Text>
        </Animated.View>
      ) : hint ? (
        <Text className="mt-1.5 text-xs text-ink-500">{hint}</Text>
      ) : null}
    </View>
  );
});

export default Input;

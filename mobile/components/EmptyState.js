import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { MotiView } from 'moti';

export default function EmptyState({ icon = 'sparkles-outline', title, subtitle, children }) {
  return (
    <Animated.View entering={FadeInUp.duration(450)} className="flex-1 items-center justify-center px-10 py-12">
      <View className="mb-7 h-28 w-28 items-center justify-center">
        {/* Expanding pulse ring */}
        <MotiView
          from={{ scale: 0.8, opacity: 0.55 }}
          animate={{ scale: 1.35, opacity: 0 }}
          transition={{ type: 'timing', duration: 2000, loop: true, repeatReverse: false }}
          style={{ position: 'absolute', width: 112, height: 112, borderRadius: 56, backgroundColor: '#DCE7FF' }}
        />
        <View className="h-28 w-28 items-center justify-center rounded-full bg-brand-50">
          {/* Gently floating icon */}
          <MotiView
            from={{ translateY: 3 }}
            animate={{ translateY: -5 }}
            transition={{ type: 'timing', duration: 1600, loop: true }}
            style={{ width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#DCE7FF' }}
          >
            <Ionicons name={icon} size={34} color="#2F6BFF" />
          </MotiView>
        </View>
      </View>
      <Text className="text-center text-xl font-bold tracking-tight text-ink-900">{title}</Text>
      {subtitle ? <Text className="mt-2 text-center text-[15px] leading-[22px] text-ink-500">{subtitle}</Text> : null}
      {children ? <View className="mt-7 w-full">{children}</View> : null}
    </Animated.View>
  );
}

import { Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import IconButton from './IconButton';

// Small glass chip that drifts up and down forever (decoration only)
function FloatingChip({ icon, style, delay, duration = 2400, size = 40 }) {
  return (
    <Animated.View entering={ZoomIn.delay(delay).springify().damping(12)} style={[{ position: 'absolute' }, style]} pointerEvents="none">
      <MotiView
        from={{ translateY: 0, rotate: '-6deg' }}
        animate={{ translateY: -10, rotate: '6deg' }}
        transition={{ type: 'timing', duration, loop: true }}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.32,
          backgroundColor: 'rgba(255,255,255,0.14)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.22)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={size * 0.45} color="#fff" />
      </MotiView>
    </Animated.View>
  );
}

/**
 * Gradient header for the auth screens: back button, animated logo mark, title and subtitle,
 * with slow-moving blobs and floating icon chips behind. Extends 32px under the form sheet.
 */
export default function AuthHero({ title, subtitle, onBack, icon = 'briefcase' }) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#0F1E52', '#1A46BD', '#2F6BFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ paddingTop: insets.top + 8, paddingBottom: 64, overflow: 'hidden' }}
    >
      {/* Drifting light blobs */}
      <MotiView
        pointerEvents="none"
        from={{ translateX: -20, translateY: 0 }}
        animate={{ translateX: 30, translateY: 25 }}
        transition={{ type: 'timing', duration: 6000, loop: true }}
        style={{ position: 'absolute', top: -90, left: -90, width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(90,139,255,0.35)' }}
      />
      <MotiView
        pointerEvents="none"
        from={{ translateX: 0, translateY: 0 }}
        animate={{ translateX: -30, translateY: -20 }}
        transition={{ type: 'timing', duration: 7000, loop: true }}
        style={{ position: 'absolute', bottom: -70, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(124,58,237,0.28)' }}
      />
      <View pointerEvents="none" className="absolute -right-16 top-6 h-48 w-48 rounded-full border border-white/10" />

      <FloatingChip icon="sparkles" delay={350} style={{ right: 28, top: insets.top + 64 }} />
      <FloatingChip icon="paper-plane" delay={500} duration={2800} size={34} style={{ right: 92, top: insets.top + 128 }} />
      <FloatingChip icon="bookmark" delay={650} duration={2000} size={30} style={{ right: 24, top: insets.top + 150 }} />

      <View className="px-6">
        {onBack ? <IconButton icon="chevron-back" variant="glass" label="Back" onPress={onBack} /> : <View style={{ height: 44 }} />}

        <Animated.View entering={ZoomIn.delay(100).springify().damping(12)} className="mt-6 self-start">
          <View
            className="h-14 w-14 items-center justify-center rounded-[18px] bg-white"
            style={{ shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 }}
          >
            <Ionicons name={icon} size={26} color="#1F55E0" />
          </View>
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(180).duration(500)} className="mt-5 text-[32px] font-extrabold leading-[38px] tracking-tight text-white">
          {title}
        </Animated.Text>
        {subtitle ? (
          <Animated.View entering={FadeIn.delay(300).duration(500)}>
            <Text className="mt-2 max-w-[78%] text-[15px] leading-[22px] text-white/75">{subtitle}</Text>
          </Animated.View>
        ) : null}
      </View>
    </LinearGradient>
  );
}

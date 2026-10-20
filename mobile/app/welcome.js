import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import Button from '../components/Button';
import CompanyLogo from '../components/CompanyLogo';
import LegalLinks from '../components/LegalLinks';

// Illustration-only sample cards
const SAMPLE = [
  { company: 'Northwind', title: 'Product Designer', meta: 'Remote · Full-time', rotate: '-7deg', x: -34, y: 26, delay: 0 },
  { company: 'Lumen Labs', title: 'Frontend Engineer', meta: 'Hybrid · Contract', rotate: '6deg', x: 34, y: 8, delay: 400 },
  { company: 'Orbit', title: 'Data Analyst', meta: 'On-site · Full-time', rotate: '-1deg', x: 0, y: -12, delay: 800 },
];

function Blob({ size, color, from, to, duration, style }) {
  return (
    <MotiView
      pointerEvents="none"
      from={from}
      animate={to}
      transition={{ type: 'timing', duration, loop: true }}
      style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]}
    />
  );
}

function FloatingCard({ company, title, meta, rotate, x, y, delay, index }) {
  return (
    <View style={{ position: 'absolute', transform: [{ translateX: x }, { translateY: y }, { rotate }] }}>
      <Animated.View
        entering={FadeInDown.delay(250 + index * 150)
          .springify()
          .damping(14)}
      >
        <MotiView
          from={{ translateY: 0 }}
          animate={{ translateY: -10 }}
          transition={{ type: 'timing', duration: 2200, loop: true, delay }}
          style={{
            width: 236,
            borderRadius: 22,
            backgroundColor: '#FFFFFF',
            padding: 14,
            shadowColor: '#0B1220',
            shadowOpacity: 0.25,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 14 },
            elevation: 12,
          }}
        >
          <View className="flex-row items-center">
            <CompanyLogo name={company} size={38} />
            <View className="ml-2.5 flex-1">
              <Text className="text-[14px] font-bold text-ink-900" numberOfLines={1}>
                {title}
              </Text>
              <Text className="text-[11px] text-ink-500">{company}</Text>
            </View>
          </View>
          <View className="mt-3 flex-row items-center justify-between">
            <View className="rounded-md bg-ink-100 px-2 py-1">
              <Text className="text-[10px] font-semibold text-ink-700">{meta}</Text>
            </View>
            <View className="h-6 w-6 items-center justify-center rounded-full bg-brand-50">
              <Ionicons name="bookmark" size={11} color="#2F6BFF" />
            </View>
          </View>
        </MotiView>
      </Animated.View>
    </View>
  );
}

export default function Welcome() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#0F1E52', '#1A46BD', '#2F6BFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Blob
        size={300}
        color="rgba(90,139,255,0.35)"
        from={{ translateX: -40, translateY: 0 }}
        to={{ translateX: 30, translateY: 40 }}
        duration={6000}
        style={{ top: -80, left: -120 }}
      />
      <Blob
        size={240}
        color="rgba(124,58,237,0.25)"
        from={{ translateX: 0, translateY: 0 }}
        to={{ translateX: -40, translateY: -30 }}
        duration={7000}
        style={{ top: 260, right: -110 }}
      />

      <SafeAreaView className="flex-1 justify-between px-6 pb-4">
        <Animated.View entering={FadeIn.duration(600)} className="mt-4 flex-row items-center">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-white">
            <Ionicons name="briefcase" size={20} color="#1F55E0" />
          </View>
          <Text className="ml-2.5 text-lg font-extrabold tracking-tight text-white">ApplyUp</Text>
        </Animated.View>

        {/* Hero illustration */}
        <View className="items-center justify-center" style={{ height: 260 }}>
          {SAMPLE.map((c, i) => (
            <FloatingCard key={c.company} index={i} {...c} />
          ))}
          <Animated.View entering={ZoomIn.delay(900).springify().damping(10)} style={{ position: 'absolute', top: 10, right: 6 }}>
            <MotiView
              from={{ translateY: 0, rotate: '-4deg' }}
              animate={{ translateY: -8, rotate: '4deg' }}
              transition={{ type: 'timing', duration: 1800, loop: true }}
              style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 999, backgroundColor: '#16A34A', paddingHorizontal: 12, paddingVertical: 7 }}
            >
              <Ionicons name="sparkles" size={13} color="#fff" />
              <Text className="ml-1 text-xs font-bold text-white">94% match</Text>
            </MotiView>
          </Animated.View>
          <Animated.View entering={ZoomIn.delay(1050).springify().damping(10)} style={{ position: 'absolute', bottom: 0, left: 8 }}>
            <MotiView
              from={{ scale: 1 }}
              animate={{ scale: 1.1 }}
              transition={{ type: 'timing', duration: 1300, loop: true }}
              style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="paper-plane" size={20} color="#2F6BFF" />
            </MotiView>
          </Animated.View>
        </View>

        <View>
          <Animated.Text entering={FadeInDown.delay(500).duration(600)} className="text-[38px] font-extrabold leading-[44px] tracking-tight text-white">
            Your next role,{'\n'}one swipe away.
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(620).duration(600)} className="mt-3 text-base leading-6 text-white/75">
            Discover jobs that fit you, apply in one tap, and track every step in one place.
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(760).springify().damping(16)} className="mt-8 gap-3">
            <Button
              title="Get started"
              variant="white"
              onPress={() => router.push('/(auth)/register')}
              iconRight
              icon={<Ionicons name="arrow-forward" size={18} color="#1A46BD" />}
            />
            <Button title="I already have an account" variant="glass" onPress={() => router.push('/(auth)/login')} />
          </Animated.View>
          <Animated.View entering={FadeIn.delay(1000)}>
            <LegalLinks prefix="By continuing you agree to our" className="mt-4 text-center text-xs text-white/55" linkClassName="text-white/80" />
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

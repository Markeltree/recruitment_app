import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AiButton, { AI_GRADIENT, SparkleIcon } from './AiSparkle';
import AnimatedCounter from './AnimatedCounter';
import ProgressRing from './ProgressRing';
import Skeleton from './Skeleton';
import { aiApi } from '../lib/api';
import { shadow } from '../constants/theme';

const STEPS = ['Reading the job description…', 'Comparing it with your profile…', 'Weighing strengths and gaps…', 'Writing your breakdown…'];

const scoreTone = (s) =>
  s >= 80
    ? { color: '#16A34A', track: '#DCFCE7', label: 'Strong fit' }
    : s >= 60
      ? { color: '#2F6BFF', track: '#DCE7FF', label: 'Good fit' }
      : s >= 40
        ? { color: '#F59E0B', track: '#FEF3C7', label: 'Partial fit' }
        : { color: '#E11D48', track: '#FFE4E6', label: 'Stretch role' };

// Cycles through progress messages so the wait feels alive
function LoadingState() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 1700);
    return () => clearInterval(t);
  }, []);
  return (
    <Animated.View entering={FadeIn} exiting={FadeOut.duration(150)}>
      <View className="flex-row items-center">
        <LinearGradient colors={AI_GRADIENT} style={{ width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
          <SparkleIcon busy />
        </LinearGradient>
        <View className="ml-3 h-5 flex-1 justify-center overflow-hidden">
          <Animated.Text key={step} entering={FadeInDown.duration(250)} exiting={FadeOut.duration(150)} className="text-sm font-semibold text-ink-700">
            {STEPS[step]}
          </Animated.Text>
        </View>
      </View>
      <View className="mt-4">
        <Skeleton width="90%" />
        <Skeleton width="75%" style={{ marginTop: 10 }} />
        <Skeleton width="60%" style={{ marginTop: 10 }} />
      </View>
    </Animated.View>
  );
}

function Point({ icon, color, bg, text, delay }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify().damping(16)} className="mt-2.5 flex-row">
      <View className="mt-0.5 h-5 w-5 items-center justify-center rounded-full" style={{ backgroundColor: bg }}>
        <Ionicons name={icon} size={12} color={color} />
      </View>
      <Text className="ml-2.5 flex-1 text-sm leading-5 text-ink-700">{text}</Text>
    </Animated.View>
  );
}

function Result({ data, onRefresh }) {
  const tone = scoreTone(data.score);
  return (
    <Animated.View entering={FadeIn.duration(300)}>
      <View className="flex-row items-center">
        <ProgressRing progress={data.score / 100} size={72} stroke={7} color={tone.color} track={tone.track} duration={1100}>
          <AnimatedCounter value={data.score} duration={1100} className="text-xl font-extrabold text-ink-900" />
        </ProgressRing>
        <View className="ml-4 flex-1">
          <View className="flex-row items-center">
            <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: tone.track }}>
              <Text className="text-[11px] font-bold" style={{ color: tone.color }}>
                {tone.label}
              </Text>
            </View>
          </View>
          <Animated.Text entering={FadeInDown.delay(150)} className="mt-1.5 text-[15px] font-bold leading-5 text-ink-900">
            {data.verdict}
          </Animated.Text>
        </View>
      </View>

      {data.strengths?.length ? (
        <View className="mt-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-ink-400">Why you fit</Text>
          {data.strengths.map((t, i) => (
            <Point key={t} icon="checkmark" color="#16A34A" bg="#DCFCE7" text={t} delay={250 + i * 90} />
          ))}
        </View>
      ) : null}

      {data.gaps?.length ? (
        <View className="mt-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-ink-400">Gaps to address</Text>
          {data.gaps.map((t, i) => (
            <Point key={t} icon="alert" color="#B45309" bg="#FEF3C7" text={t} delay={450 + i * 90} />
          ))}
        </View>
      ) : null}

      {data.tip ? (
        <Animated.View entering={FadeInDown.delay(650).springify().damping(16)} className="mt-4 flex-row rounded-2xl bg-violet-50 p-3.5">
          <Ionicons name="bulb" size={18} color="#7C3AED" />
          <Text className="ml-2.5 flex-1 text-sm leading-5 text-ink-700">{data.tip}</Text>
        </Animated.View>
      ) : null}

      <View className="mt-4 flex-row items-center justify-between border-t border-line pt-3">
        <Text className="text-[11px] text-ink-400">AI-generated · may not be perfect</Text>
        <Pressable onPress={onRefresh} hitSlop={8} className="flex-row items-center">
          <Ionicons name="refresh" size={13} color="#2F6BFF" />
          <Text className="ml-1 text-xs font-semibold text-brand-600">Re-analyze</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

// "How well do you match?" card on the job detail screen. Runs only when the user asks.
export default function AiMatchCard({ jobId }) {
  const [state, setState] = useState('idle'); // idle | loading | done | error
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const run = async (refresh) => {
    setState('loading');
    setError('');
    try {
      const result = await aiApi.match(jobId, refresh);
      setData(result);
      setState('done');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (e) {
      setError(e.message);
      setState('error');
    }
  };

  return (
    // Shadow on the outer layer, clipping on the inner one (iOS drops shadows on clipped views)
    <Animated.View layout={LinearTransition.springify().damping(18)} className="mt-4 rounded-[22px] bg-white" style={shadow.md}>
      <View className="overflow-hidden rounded-[22px] border border-line">
        {/* Gradient hairline on top marks this as an AI surface */}
        <LinearGradient colors={AI_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 3 }} />
        <View className="p-5">
          <View className="mb-3 flex-row items-center">
            <Ionicons name="sparkles" size={16} color="#7C3AED" />
            <Text className="ml-2 text-base font-bold text-ink-900">AI match insight</Text>
          </View>

          {state === 'idle' ? (
            <Animated.View entering={FadeIn} exiting={FadeOut.duration(150)}>
              <Text className="mb-4 text-sm leading-5 text-ink-500">
                See how your profile lines up with this role: your strengths, the gaps, and one tip to stand out.
              </Text>
              <AiButton title="Analyze my fit" onPress={() => run(false)} />
            </Animated.View>
          ) : null}

          {state === 'loading' ? <LoadingState /> : null}
          {state === 'done' && data ? <Result data={data} onRefresh={() => run(true)} /> : null}

          {state === 'error' ? (
            <Animated.View entering={FadeIn}>
              <View className="flex-row items-center rounded-2xl bg-rose-50 p-3.5">
                <Ionicons name="alert-circle" size={18} color="#E11D48" />
                <Text className="ml-2 flex-1 text-sm font-medium text-danger">{error}</Text>
              </View>
              <Pressable onPress={() => run(false)} className="mt-3 items-center">
                <Text className="text-sm font-semibold text-brand-600">Try again</Text>
              </Pressable>
            </Animated.View>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AiButton from '../../components/AiSparkle';
import { SegmentedSwitch } from '../../components/AuthBits';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import CompanyLogo from '../../components/CompanyLogo';
import Input from '../../components/Input';
import PortfolioCard from '../../components/PortfolioCard';
import { ModalHeader } from '../../components/ScreenHeader';
import Skeleton from '../../components/Skeleton';
import SuccessBurst from '../../components/SuccessBurst';
import { aiApi, applicationsApi, jobsApi } from '../../lib/api';
import { formatSalary, shadow } from '../../constants/theme';
import { useAuth } from '../../store/auth';

const MAX_ATTACHMENTS = 3;
const MIN_LETTER = 30;

const TONES = [
  ['professional', 'Professional'],
  ['friendly', 'Friendly'],
  ['concise', 'Concise'],
];
const AVAILABILITY = [
  ['immediately', 'Immediately'],
  ['1-week', 'In 1 week'],
  ['2-weeks', 'In 2 weeks'],
  ['1-month', 'In a month'],
  ['flexible', 'Flexible'],
];
const PERIODS = [
  { key: 'month', label: 'Per month', icon: 'calendar-outline' },
  { key: 'hour', label: 'Per hour', icon: 'time-outline' },
];

function Step({ n, title, subtitle, right, children, delay = 0, done }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify().damping(16)} className="mt-4 rounded-[22px] border border-line bg-white p-5" style={shadow.sm}>
      <View className="mb-3 flex-row items-center">
        <View className={`h-7 w-7 items-center justify-center rounded-full ${done ? 'bg-success' : 'bg-ink-900'}`}>
          {done ? <Ionicons name="checkmark" size={15} color="#fff" /> : <Text className="text-xs font-bold text-white">{n}</Text>}
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-base font-bold text-ink-900">{title}</Text>
          {subtitle ? <Text className="text-xs text-ink-500">{subtitle}</Text> : null}
        </View>
        {right}
      </View>
      {children}
    </Animated.View>
  );
}

export default function SendProposal() {
  const { jobId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const portfolio = useAuth((s) => s.user?.portfolio) || [];

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [letter, setLetter] = useState('');
  const [tone, setTone] = useState('professional');
  const [drafting, setDrafting] = useState(false);
  const [aiDrafted, setAiDrafted] = useState(false);
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('month');
  const [availability, setAvailability] = useState(null);
  const [picked, setPicked] = useState([]);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState('');
  const [sent, setSent] = useState(false);
  const typing = useRef(null);

  useEffect(() => () => cancelAnimationFrame(typing.current), []);

  useEffect(() => {
    jobsApi
      .get(jobId)
      .then((j) => {
        setJob(j);
        // Contract and part-time roles are usually priced per hour
        if (['contract', 'part-time'].includes(j.type)) setPeriod('hour');
      })
      .catch((e) => setFormError(e.message))
      .finally(() => setLoading(false));
  }, [jobId]);

  // Reveal the AI draft a few characters per frame, like it is being typed
  const typeOut = (text) => {
    cancelAnimationFrame(typing.current);
    let i = 0;
    const step = () => {
      i = Math.min(text.length, i + 6);
      setLetter(text.slice(0, i));
      if (i < text.length) typing.current = requestAnimationFrame(step);
    };
    step();
  };

  const writeWithAi = async () => {
    setErrors((e) => ({ ...e, letter: undefined }));
    setDrafting(true);
    try {
      const draft = await aiApi.coverNote(jobId, tone);
      setAiDrafted(true);
      typeOut(draft);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (err) {
      setErrors((e) => ({ ...e, letter: err.message }));
    } finally {
      setDrafting(false);
    }
  };

  const toggleProject = (id) => {
    setPicked((list) => (list.includes(id) ? list.filter((x) => x !== id) : list.length >= MAX_ATTACHMENTS ? list : [...list, id]));
  };

  const payNumber = Number(amount.replace(/,/g, ''));

  const send = async () => {
    setFormError('');
    const e = {};
    if (letter.trim().length < MIN_LETTER) e.letter = `Write at least ${MIN_LETTER} characters so the employer knows why you're a fit`;
    if (amount && !(payNumber > 0)) e.amount = 'Enter a valid amount';
    setErrors(e);
    if (Object.keys(e).length) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      return;
    }

    setSending(true);
    try {
      await applicationsApi.apply(jobId, {
        coverNote: letter.trim(),
        expectedPay: amount ? { amount: payNumber, period } : undefined,
        availability: availability || undefined,
        portfolioIds: picked.length ? picked : undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setSent(true);
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setFormError(err.details?.map((d) => d.message).join(' · ') || err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#2F6BFF" />
      </View>
    );
  }

  const currency = job?.currency || 'USD';

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <StatusBar style="dark" />
      <ModalHeader
        title="Send proposal"
        left={
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Text className="text-[15px] font-medium text-ink-500">Cancel</Text>
          </Pressable>
        }
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 150 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {job ? (
            <Animated.View entering={FadeInDown.duration(300)} className="mt-4 flex-row items-center rounded-[22px] bg-ink-900 p-4">
              <CompanyLogo name={job.company} uri={job.companyLogo} size={46} />
              <View className="ml-3 flex-1">
                <Text className="text-[15px] font-bold text-white" numberOfLines={1}>
                  {job.title}
                </Text>
                <Text className="mt-0.5 text-xs text-white/60" numberOfLines={1}>
                  {job.company} · {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                </Text>
              </View>
            </Animated.View>
          ) : null}

          {/* 1. Cover letter */}
          <Step
            n={1}
            delay={60}
            done={letter.trim().length >= MIN_LETTER}
            title="Cover letter"
            subtitle="Why you're the right person for this role"
            right={<AiButton size="sm" title={letter ? 'Rewrite' : 'Write with AI'} busy={drafting} onPress={writeWithAi} />}
          >
            <View className="mb-3 flex-row gap-2">
              {TONES.map(([k, l]) => (
                <Chip key={k} label={l} selected={tone === k} onPress={() => setTone(k)} />
              ))}
            </View>
            <View>
              <Input
                multiline
                editable={!drafting}
                value={letter}
                maxLength={1000}
                autoCapitalize="sentences"
                placeholder="Introduce yourself, highlight relevant work, and say how you'd approach this role."
                error={errors.letter}
                hint={aiDrafted ? `AI draft · review and edit before sending · ${letter.length}/1000` : `${letter.length}/1000`}
                onChangeText={(v) => {
                  cancelAnimationFrame(typing.current);
                  setLetter(v);
                  if (errors.letter) setErrors((e) => ({ ...e, letter: undefined }));
                }}
                className="mb-0"
              />
              {drafting ? (
                <Animated.View
                  entering={FadeIn}
                  exiting={FadeOut}
                  pointerEvents="none"
                  className="absolute left-0 right-0 top-0 items-center justify-center rounded-2xl bg-white/85"
                  style={{ height: 128 }}
                >
                  <Text className="text-sm font-semibold text-violet-700">Writing your cover letter…</Text>
                  <View className="mt-3 w-2/3">
                    <Skeleton height={10} />
                    <Skeleton height={10} width="80%" style={{ marginTop: 8 }} />
                  </View>
                </Animated.View>
              ) : null}
            </View>
          </Step>

          {/* 2. Rate */}
          <Step n={2} delay={120} done={payNumber > 0} title="Your rate" subtitle={`Optional · posted range: ${formatSalary(job?.salaryMin, job?.salaryMax, currency)}`}>
            <SegmentedSwitch options={PERIODS} value={period} onChange={setPeriod} />
            <View className="mt-3">
              <Input
                icon="cash-outline"
                placeholder={period === 'hour' ? 'e.g. 25' : 'e.g. 3500'}
                keyboardType="decimal-pad"
                value={amount}
                error={errors.amount}
                hint={amount && payNumber > 0 ? `${currency} ${payNumber.toLocaleString()} ${period === 'hour' ? 'per hour' : 'per month'}` : `Amount in ${currency}`}
                onChangeText={(v) => {
                  setAmount(v.replace(/[^0-9.,]/g, ''));
                  if (errors.amount) setErrors((e) => ({ ...e, amount: undefined }));
                }}
                className="mb-0"
              />
            </View>
          </Step>

          {/* 3. Availability */}
          <Step n={3} delay={180} done={!!availability} title="Availability" subtitle="When could you start?">
            <View className="flex-row flex-wrap gap-2">
              {AVAILABILITY.map(([k, l]) => (
                <Chip key={k} label={l} selected={availability === k} onPress={() => setAvailability(availability === k ? null : k)} />
              ))}
            </View>
          </Step>

          {/* 4. Attachments */}
          <Step
            n={4}
            delay={240}
            done={picked.length > 0}
            title="Attach previous work"
            subtitle={portfolio.length ? `${picked.length}/${MAX_ATTACHMENTS} selected` : 'Optional · from your portfolio'}
            right={
              portfolio.length ? (
                <Pressable onPress={() => router.push('/portfolio-edit')} hitSlop={8} className="flex-row items-center">
                  <Ionicons name="add" size={16} color="#2F6BFF" />
                  <Text className="text-xs font-bold text-brand-600">New</Text>
                </Pressable>
              ) : null
            }
          >
            {portfolio.length ? (
              portfolio.map((p) => (
                <PortfolioCard
                  key={p._id}
                  item={p}
                  selectable
                  selected={picked.includes(p._id)}
                  disabled={!picked.includes(p._id) && picked.length >= MAX_ATTACHMENTS}
                  onPress={() => toggleProject(p._id)}
                />
              ))
            ) : (
              <Pressable onPress={() => router.push('/portfolio-edit')} className="items-center rounded-2xl border-[1.5px] border-dashed border-ink-300 py-6 active:bg-ink-100">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-brand-50">
                  <Ionicons name="add" size={22} color="#2F6BFF" />
                </View>
                <Text className="mt-2 text-sm font-bold text-ink-900">Add a project</Text>
                <Text className="mt-0.5 text-xs text-ink-500">Show work that proves you can do this job</Text>
              </Pressable>
            )}
          </Step>

          {formError ? (
            <Animated.View entering={FadeInDown} className="mt-4 flex-row items-center rounded-2xl bg-rose-50 p-3.5">
              <Ionicons name="alert-circle" size={18} color="#E11D48" />
              <Text className="ml-2 flex-1 text-sm font-medium text-danger">{formError}</Text>
            </Animated.View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <Animated.View
        entering={FadeInUp.delay(300).springify().damping(16)}
        style={[{ paddingBottom: Math.max(insets.bottom, 14) }, shadow.lg]}
        className="absolute bottom-0 left-0 right-0 rounded-t-[28px] border-t border-line bg-white px-5 pt-4"
      >
        <View className="mb-3 flex-row items-center justify-center gap-3">
          <Summary icon="document-text-outline" label={letter.trim().length >= MIN_LETTER ? 'Letter ready' : 'Letter needed'} ok={letter.trim().length >= MIN_LETTER} />
          <Summary icon="cash-outline" label={payNumber > 0 ? `${payNumber.toLocaleString()}/${period === 'hour' ? 'hr' : 'mo'}` : 'No rate'} ok={payNumber > 0} />
          <Summary icon="attach" label={`${picked.length} attached`} ok={picked.length > 0} />
        </View>
        <Button title="Send proposal" onPress={send} loading={sending} disabled={drafting} iconRight icon={<Ionicons name="paper-plane" size={17} color="#fff" />} />
      </Animated.View>

      {sent ? (
        <SuccessBurst
          title="Proposal sent!"
          subtitle={`${job?.company || 'The employer'} will review your proposal${picked.length ? ` and ${picked.length} attached project${picked.length > 1 ? 's' : ''}` : ''}. We'll notify you of every update.`}
          primary={{ title: 'Track application', onPress: () => router.navigate('/(tabs)/applications') }}
          secondary={{ title: 'Back to job', onPress: () => router.back() }}
        />
      ) : null}
    </SafeAreaView>
  );
}

function Summary({ icon, label, ok }) {
  return (
    <View className="flex-row items-center">
      <Ionicons name={ok ? 'checkmark-circle' : icon} size={14} color={ok ? '#16A34A' : '#94A3B8'} />
      <Text className={`ml-1 text-xs font-semibold ${ok ? 'text-ink-700' : 'text-ink-400'}`}>{label}</Text>
    </View>
  );
}

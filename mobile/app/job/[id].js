import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Share, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  Extrapolation,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AiButton from '../../components/AiSparkle';
import AiMatchCard from '../../components/AiMatchCard';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import CompanyLogo from '../../components/CompanyLogo';
import EmptyState from '../../components/EmptyState';
import IconButton from '../../components/IconButton';
import Input from '../../components/Input';
import Skeleton from '../../components/Skeleton';
import StatusBadge from '../../components/StatusBadge';
import SuccessBurst from '../../components/SuccessBurst';
import { aiApi, applicationsApi, jobsApi, swipesApi } from '../../lib/api';
import { formatSalary, shadow, timeAgo } from '../../constants/theme';

export default function JobDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [applying, setApplying] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [tone, setTone] = useState('professional');
  const [drafting, setDrafting] = useState(false);
  const [aiDrafted, setAiDrafted] = useState(false);
  const [noteError, setNoteError] = useState('');
  const typing = useRef(null);

  useEffect(() => () => cancelAnimationFrame(typing.current), []);

  useEffect(() => {
    jobsApi
      .get(id)
      .then((j) => {
        setJob(j);
        setSaved(j.swipe === 'save');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const apply = async () => {
    setError('');
    setApplying(true);
    try {
      await applicationsApi.apply(id, note.trim() || undefined);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setSuccess(true);
      setCelebrate(true);
      setJob((j) => ({ ...j, applied: true, applicationStatus: 'applied' }));
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setError(err.message);
    } finally {
      setApplying(false);
    }
  };

  // Reveal the AI draft a few characters per frame, like it is being typed
  const typeOut = (text) => {
    cancelAnimationFrame(typing.current);
    let i = 0;
    const step = () => {
      i = Math.min(text.length, i + 6);
      setNote(text.slice(0, i));
      if (i < text.length) typing.current = requestAnimationFrame(step);
    };
    step();
  };

  const writeWithAi = async () => {
    setShowNote(true);
    setNoteError('');
    setDrafting(true);
    try {
      const draft = await aiApi.coverNote(id, tone);
      setAiDrafted(true);
      typeOut(draft);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (err) {
      setNoteError(err.message);
    } finally {
      setDrafting(false);
    }
  };

  const toggleSave = async () => {
    const next = !saved;
    setSaved(next);
    try {
      if (next) await swipesApi.record(id, 'save');
      else await swipesApi.undo(id);
    } catch {
      setSaved(!next);
    }
  };

  const share = () => {
    Share.share({ message: `${job.title} at ${job.company} — found on ApplyUp` }).catch(() => {});
  };

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  // Top bar gains a surface + the job title once the hero scrolls away
  const barBg = useAnimatedStyle(() => ({ opacity: interpolate(scrollY.value, [80, 150], [0, 1], Extrapolation.CLAMP) }));
  const barTitle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [130, 180], [0, 1], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(scrollY.value, [130, 180], [8, 0], Extrapolation.CLAMP) }],
  }));
  // Hero logo: grows on pull-down, shrinks and fades while scrolling up
  const heroStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 160], [1, 0], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(scrollY.value, [-120, 0, 160], [-30, 0, 50], Extrapolation.CLAMP) },
      { scale: interpolate(scrollY.value, [-120, 0, 160], [1.25, 1, 0.8], Extrapolation.CLAMP) },
    ],
  }));

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#2F6BFF" />
      </View>
    );
  }

  if (!job) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <EmptyState icon="briefcase-outline" title="Job unavailable" subtitle="This role has been closed or removed by the employer.">
          <Button title="Go back" variant="outline" onPress={() => router.back()} />
        </EmptyState>
      </SafeAreaView>
    );
  }

  const applied = job.applied || success;

  return (
    <View className="flex-1 bg-background">
      {/* Top bar */}
      <StatusBar style="dark" />
      <View style={{ paddingTop: insets.top + 6, zIndex: 20 }} className="absolute left-0 right-0 top-0 flex-row items-center justify-between px-5 pb-2">
        <Animated.View pointerEvents="none" style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, barBg]} className="border-b border-line bg-white" />
        <IconButton icon="chevron-back" label="Back" onPress={() => router.back()} />
        <Animated.Text style={barTitle} className="mx-3 flex-1 text-center text-base font-bold text-ink-900" numberOfLines={1}>
          {job.title}
        </Animated.Text>
        <View className="flex-row gap-2">
          <IconButton icon="share-outline" label="Share" onPress={share} />
          <IconButton
            icon={saved ? 'bookmark' : 'bookmark-outline'}
            color={saved ? '#2F6BFF' : undefined}
            label={saved ? 'Remove from saved' : 'Save job'}
            onPress={toggleSave}
          />
        </View>
      </View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: insets.top + 56, paddingBottom: 170 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <View className="items-center px-6 pb-2 pt-4">
          <Animated.View style={heroStyle}>
            <Animated.View entering={FadeInDown.springify().damping(13)}>
              <CompanyLogo name={job.company} uri={job.companyLogo} size={76} />
            </Animated.View>
          </Animated.View>
          <Animated.Text entering={FadeInDown.delay(80).duration(400)} className="mt-4 text-center text-[26px] font-extrabold leading-8 tracking-tight text-ink-900">
            {job.title}
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(140).duration(400)} className="mt-1.5 text-center text-[15px] font-medium text-ink-500">
            {job.company}
            {job.location ? ` · ${job.location}` : ''}
          </Animated.Text>
          <Animated.View entering={FadeInDown.delay(200).duration(400)} className="mt-3 flex-row items-center gap-2">
            {job.createdAt ? (
              <View className="flex-row items-center rounded-full bg-white px-2.5 py-1" style={shadow.sm}>
                <Ionicons name="time-outline" size={12} color="#64748B" />
                <Text className="ml-1 text-xs font-medium text-ink-500">{timeAgo(job.createdAt)}</Text>
              </View>
            ) : null}
            {job.matchScore ? (
              <View className="flex-row items-center rounded-full bg-green-50 px-2.5 py-1">
                <Ionicons name="sparkles" size={12} color="#16A34A" />
                <Text className="ml-1 text-xs font-bold text-green-700">{job.matchScore}% match</Text>
              </View>
            ) : null}
          </Animated.View>
        </View>

        <View className="px-5">
          {/* Key facts */}
          <Animated.View entering={FadeInDown.delay(260).springify().damping(16)} className="mt-5 flex-row flex-wrap rounded-[22px] border border-line bg-white p-2" style={shadow.sm}>
            <Info icon="cash-outline" label="Salary" value={formatSalary(job.salaryMin, job.salaryMax, job.currency)} />
            <Info icon="briefcase-outline" label="Job type" value={job.type} />
            <Info icon="globe-outline" label="Work mode" value={job.workMode} />
            <Info icon="trending-up-outline" label="Experience" value={job.experienceYears ? `${job.experienceYears}+ years` : 'Any level'} />
          </Animated.View>

          <AiMatchCard jobId={id} />

          <Section title="About the role" icon="document-text-outline" delay={320}>
            <Text className="text-[15px] leading-6 text-ink-700">{job.description}</Text>
          </Section>

          {job.requirements?.length ? (
            <Section title="Requirements" icon="list-outline" delay={380}>
              {job.requirements.map((r, i) => (
                <View key={r} className={`flex-row ${i ? 'mt-3' : ''}`}>
                  <View className="mt-0.5 h-5 w-5 items-center justify-center rounded-full bg-green-50">
                    <Ionicons name="checkmark" size={13} color="#16A34A" />
                  </View>
                  <Text className="ml-3 flex-1 text-[15px] leading-6 text-ink-700">{r}</Text>
                </View>
              ))}
            </Section>
          ) : null}

          {job.skills?.length ? (
            <Section title="Skills" icon="construct-outline" delay={440}>
              <View className="flex-row flex-wrap gap-2">
                {job.skills.map((s, i) => (
                  <Animated.View key={s} entering={FadeIn.delay(500 + i * 50)} className="rounded-lg bg-brand-50 px-3 py-1.5">
                    <Text className="text-xs font-semibold text-brand-600">{s}</Text>
                  </Animated.View>
                ))}
              </View>
            </Section>
          ) : null}

          {showNote && !applied ? (
            <Section
              title="Cover note"
              icon="create-outline"
              right={<AiButton size="sm" title={note ? 'Rewrite' : 'Write with AI'} busy={drafting} onPress={writeWithAi} />}
            >
              <View className="mb-3 flex-row gap-2">
                {[
                  ['professional', 'Professional'],
                  ['friendly', 'Friendly'],
                  ['concise', 'Concise'],
                ].map(([k, l]) => (
                  <Chip key={k} label={l} selected={tone === k} onPress={() => setTone(k)} />
                ))}
              </View>
              <View>
                <Input
                  multiline
                  autoFocus={!drafting}
                  editable={!drafting}
                  value={note}
                  onChangeText={(v) => {
                    cancelAnimationFrame(typing.current);
                    setNote(v);
                  }}
                  maxLength={1000}
                  placeholder="Why are you a great fit for this role?"
                  hint={aiDrafted ? `AI draft · review and edit before sending · ${note.length}/1000` : `${note.length}/1000 · optional`}
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
                    <Text className="text-sm font-semibold text-violet-700">Writing your note…</Text>
                    <View className="mt-3 w-2/3">
                      <Skeleton height={10} />
                      <Skeleton height={10} width="80%" style={{ marginTop: 8 }} />
                    </View>
                  </Animated.View>
                ) : null}
              </View>
              {noteError ? (
                <Animated.View entering={FadeInDown} className="mt-3 flex-row items-center">
                  <Ionicons name="alert-circle" size={15} color="#E11D48" />
                  <Text className="ml-1.5 flex-1 text-xs font-medium text-danger">{noteError}</Text>
                </Animated.View>
              ) : null}
            </Section>
          ) : null}

          {error ? (
            <Animated.View entering={FadeInDown} className="mt-4 flex-row items-center rounded-2xl bg-rose-50 p-3">
              <Ionicons name="alert-circle" size={18} color="#E11D48" />
              <Text className="ml-2 flex-1 text-sm font-medium text-danger">{error}</Text>
            </Animated.View>
          ) : null}
        </View>
      </Animated.ScrollView>

      {/* Sticky action bar */}
      <Animated.View
        entering={FadeInUp.delay(300).springify().damping(16)}
        style={[{ paddingBottom: Math.max(insets.bottom, 14) }, shadow.lg]}
        className="absolute bottom-0 left-0 right-0 rounded-t-[28px] border-t border-line bg-white px-5 pt-4"
      >
        {applied ? (
          <Animated.View entering={FadeInDown.springify()} className="flex-row items-center rounded-2xl bg-green-50 p-4">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-success">
              <Ionicons name="checkmark" size={22} color="#fff" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-[15px] font-bold text-ink-900">Application sent</Text>
              <Text className="text-xs text-ink-500">You will be notified when the employer responds.</Text>
            </View>
            <StatusBadge status={job.applicationStatus || 'applied'} />
          </Animated.View>
        ) : (
          <View>
            {!showNote ? (
              <View className="mb-3 flex-row items-center justify-center gap-4">
                <Pressable onPress={() => setShowNote(true)} className="flex-row items-center" hitSlop={6}>
                  <Ionicons name="add-circle-outline" size={16} color="#2F6BFF" />
                  <Text className="ml-1 text-sm font-semibold text-brand-600">Add a cover note</Text>
                </Pressable>
                <Text className="text-ink-300">|</Text>
                <Pressable onPress={writeWithAi} className="flex-row items-center" hitSlop={6}>
                  <Ionicons name="sparkles" size={14} color="#7C3AED" />
                  <Text className="ml-1 text-sm font-semibold text-violet-700">Write with AI</Text>
                </Pressable>
              </View>
            ) : null}
            <View className="flex-row items-center gap-4">
              <View style={{ maxWidth: '42%' }}>
                <Text className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Salary</Text>
                <Text className="text-[15px] font-bold text-ink-900" numberOfLines={1}>{formatSalary(job.salaryMin, job.salaryMax, job.currency)}</Text>
              </View>
              <Button title="Apply now" onPress={apply} loading={applying} disabled={drafting} className="flex-1" icon={<Ionicons name="paper-plane" size={17} color="#fff" />} />
            </View>
          </View>
        )}
      </Animated.View>

      {celebrate ? (
        <SuccessBurst
          title="Application sent!"
          subtitle={`${job.company} will review your profile. We'll keep you posted on every update.`}
          primary={{ title: 'Track application', onPress: () => router.navigate('/(tabs)/applications') }}
          secondary={{ title: 'Keep exploring', onPress: () => setCelebrate(false) }}
        />
      ) : null}
    </View>
  );
}

function Info({ icon, label, value }) {
  return (
    <View className="w-1/2 flex-row items-center p-2.5">
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
        <Ionicons name={icon} size={18} color="#2F6BFF" />
      </View>
      <View className="ml-2.5 flex-1">
        <Text className="text-[11px] font-medium text-ink-500">{label}</Text>
        <Text className="mt-0.5 text-[13px] font-bold capitalize text-ink-900" numberOfLines={2}>{value || '—'}</Text>
      </View>
    </View>
  );
}

function Section({ title, icon, children, delay = 0, right }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify().damping(16)} className="mt-4 rounded-[22px] border border-line bg-white p-5" style={shadow.sm}>
      <View className="mb-3 flex-row items-center">
        <Ionicons name={icon} size={17} color="#0B1220" />
        <Text className="ml-2 flex-1 text-base font-bold text-ink-900">{title}</Text>
        {right}
      </View>
      {children}
    </Animated.View>
  );
}

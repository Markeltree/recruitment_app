import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInRight, FadeOutLeft, ZoomIn, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import IconButton from '../components/IconButton';
import Input from '../components/Input';
import PressableScale from '../components/PressableScale';
import { CATEGORIES, JOB_TYPES } from '../constants/config';
import { userApi } from '../lib/api';
import { useAuth } from '../store/auth';

const STEPS = ['Interests', 'Job type', 'Skills'];

const CATEGORY_ICONS = {
  Design: 'color-palette-outline',
  Engineering: 'code-slash-outline',
  Product: 'cube-outline',
  Data: 'bar-chart-outline',
  Marketing: 'megaphone-outline',
  Sales: 'trending-up-outline',
};

const TYPE_META = {
  'full-time': { icon: 'briefcase-outline', d: 'Permanent, 40 hrs/week' },
  'part-time': { icon: 'hourglass-outline', d: 'Flexible, fewer hours' },
  contract: { icon: 'document-text-outline', d: 'Fixed-term projects' },
  internship: { icon: 'school-outline', d: 'Learn on the job' },
};

// Two-column tile used for categories
function Tile({ label, icon, selected, onPress }) {
  return (
    <View className="w-1/2 p-1.5">
      <PressableScale haptic onPress={onPress} className={`rounded-2xl border-[1.5px] p-4 ${selected ? 'border-brand-500 bg-brand-50' : 'border-line bg-white'}`}>
        <View className="flex-row items-start justify-between">
          <View className={`h-10 w-10 items-center justify-center rounded-xl ${selected ? 'bg-brand-500' : 'bg-ink-100'}`}>
            <Ionicons name={icon} size={19} color={selected ? '#fff' : '#334155'} />
          </View>
          <Animated.View key={String(selected)} entering={ZoomIn.springify().damping(10)}>
            <Ionicons name={selected ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={selected ? '#2F6BFF' : '#CBD5E1'} />
          </Animated.View>
        </View>
        <Text className={`mt-4 text-[15px] font-bold ${selected ? 'text-brand-700' : 'text-ink-900'}`}>{label}</Text>
      </PressableScale>
    </View>
  );
}

// Full-width selectable row used for job types
function OptionRow({ label, icon, description, selected, onPress }) {
  return (
    <PressableScale
      haptic
      scaleTo={0.98}
      onPress={onPress}
      className={`mb-3 flex-row items-center rounded-2xl border-[1.5px] p-4 ${selected ? 'border-brand-500 bg-brand-50' : 'border-line bg-white'}`}
    >
      <View className={`h-10 w-10 items-center justify-center rounded-xl ${selected ? 'bg-brand-500' : 'bg-ink-100'}`}>
        <Ionicons name={icon} size={19} color={selected ? '#fff' : '#334155'} />
      </View>
      <View className="ml-3 flex-1">
        <Text className={`text-[15px] font-bold capitalize ${selected ? 'text-brand-700' : 'text-ink-900'}`}>{label}</Text>
        <Text className="mt-0.5 text-xs text-ink-500">{description}</Text>
      </View>
      <Animated.View key={String(selected)} entering={ZoomIn.springify().damping(10)}>
        <Ionicons name={selected ? 'checkbox' : 'square-outline'} size={22} color={selected ? '#2F6BFF' : '#CBD5E1'} />
      </Animated.View>
    </PressableScale>
  );
}

// Progress segment that springs full when its step is reached
function StepBar({ active }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withSpring(active ? 1 : 0, { damping: 18, stiffness: 120 });
  }, [active]);
  const style = useAnimatedStyle(() => ({ width: `${p.value * 100}%` }));
  return (
    <View className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
      <Animated.View style={style} className="h-full rounded-full bg-brand-500" />
    </View>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const updateUser = useAuth((s) => s.updateUser);
  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState(user?.preferences?.categories || []);
  const [jobTypes, setJobTypes] = useState(user?.preferences?.jobTypes || []);
  const [skills, setSkills] = useState((user?.skills || []).join(', '));
  const [saving, setSaving] = useState(false);

  const toggle = (list, setList, v) =>
    setList(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const finish = async () => {
    setSaving(true);
    try {
      const updated = await userApi.update({
        onboarded: true,
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        preferences: { categories, jobTypes },
      });
      updateUser(updated);
      router.replace('/(tabs)');
    } finally {
      setSaving(false);
    }
  };

  const canNext = step === 0 ? categories.length > 0 : step === 1 ? jobTypes.length > 0 : true;
  const skillList = skills.split(',').map((s) => s.trim()).filter(Boolean);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="flex-row items-center px-6 pt-2">
        {step > 0 ? (
          <IconButton icon="chevron-back" label="Back" onPress={() => setStep(step - 1)} size={40} />
        ) : user?.onboarded && router.canGoBack() ? (
          <IconButton icon="close" label="Close" onPress={() => router.back()} size={40} />
        ) : (
          <View style={{ width: 40, height: 40 }} />
        )}
        <View className="mx-4 flex-1 flex-row gap-1.5">
          {STEPS.map((_, i) => (
            <StepBar key={i} active={i <= step} />
          ))}
        </View>
        <Text className="w-10 text-right text-xs font-bold text-ink-500">{step + 1}/{STEPS.length}</Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-6">
        <Animated.View key={step} entering={FadeInRight.duration(300)} exiting={FadeOutLeft.duration(200)}>
          <Text className="mt-8 text-xs font-bold uppercase tracking-widest text-brand-600">{STEPS[step]}</Text>
          {step === 0 && (
            <>
              <Text className="mt-2 text-[28px] font-bold tracking-tight text-ink-900">What are you into?</Text>
              <Text className="mb-6 mt-2 text-base text-ink-500">Pick the areas you want to see jobs in.</Text>
              <View className="-mx-1.5 flex-row flex-wrap">
                {CATEGORIES.map((c) => (
                  <Tile key={c} label={c} icon={CATEGORY_ICONS[c] || 'grid-outline'} selected={categories.includes(c)} onPress={() => toggle(categories, setCategories, c)} />
                ))}
              </View>
            </>
          )}
          {step === 1 && (
            <>
              <Text className="mt-2 text-[28px] font-bold tracking-tight text-ink-900">Preferred job type</Text>
              <Text className="mb-6 mt-2 text-base text-ink-500">Select all that apply. You can change this anytime.</Text>
              {JOB_TYPES.map((t) => (
                <OptionRow
                  key={t}
                  label={t.replace('-', ' ')}
                  icon={TYPE_META[t]?.icon || 'briefcase-outline'}
                  description={TYPE_META[t]?.d}
                  selected={jobTypes.includes(t)}
                  onPress={() => toggle(jobTypes, setJobTypes, t)}
                />
              ))}
            </>
          )}
          {step === 2 && (
            <>
              <Text className="mt-2 text-[28px] font-bold tracking-tight text-ink-900">Your top skills</Text>
              <Text className="mb-6 mt-2 text-base text-ink-500">Separate with commas. We use these to rank your feed.</Text>
              <Input icon="construct-outline" placeholder="React Native, Figma, SQL" value={skills} onChangeText={setSkills} />
              {skillList.length ? (
                <View className="mb-4 flex-row flex-wrap gap-2">
                  {skillList.map((s) => (
                    <Animated.View key={s} entering={ZoomIn.springify().damping(12)} className="rounded-lg bg-brand-50 px-3 py-1.5">
                      <Text className="text-xs font-semibold text-brand-600">{s}</Text>
                    </Animated.View>
                  ))}
                </View>
              ) : null}
              <View className="flex-row items-center rounded-2xl border border-brand-100 bg-brand-50 p-4">
                <Ionicons name="sparkles" size={18} color="#2F6BFF" />
                <Text className="ml-3 flex-1 text-sm leading-5 text-ink-700">Jobs that match your skills appear first in Discover.</Text>
              </View>
            </>
          )}
        </Animated.View>
      </ScrollView>

      <View className="border-t border-line px-6 pb-4 pt-4">
        {step < STEPS.length - 1 ? (
          <Button title="Continue" onPress={() => setStep(step + 1)} disabled={!canNext} />
        ) : (
          <Button title="Start exploring" onPress={finish} loading={saving} icon={<Ionicons name="arrow-forward" size={18} color="#fff" />} />
        )}
      </View>
    </SafeAreaView>
  );
}

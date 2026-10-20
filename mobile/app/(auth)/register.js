import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AuthHero from '../../components/AuthHero';
import { Divider, PasswordStrength, SegmentedSwitch } from '../../components/AuthBits';
import Button from '../../components/Button';
import Input from '../../components/Input';
import LegalLinks from '../../components/LegalLinks';
import { useAuth } from '../../store/auth';

const ROLES = [
  { key: 'candidate', label: 'Find a job', icon: 'search', description: 'Swipe through roles matched to your skills.' },
  { key: 'recruiter', label: 'Hire talent', icon: 'business', description: 'Post roles and review applicants in one place.' },
];

export default function Register() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const register = useAuth((s) => s.register);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);
  const [role, setRole] = useState('candidate');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = 'Enter a valid email';
    if (form.password.length < 6) e.password = 'Use at least 6 characters';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    setFormError('');
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      return;
    }
    setLoading(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password, role });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Clear a field's error as soon as the user edits it
  const set = (k) => (v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const passwordsMatch = form.confirm.length > 0 && form.confirm === form.password && form.password.length >= 6;

  return (
    <View className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView bounces={false} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <AuthHero icon="rocket" title={'Create your\naccount'} subtitle="Join in under a minute and start discovering roles." onBack={() => router.back()} />

          {/* Form sheet slides up over the hero */}
          <Animated.View
            entering={FadeInUp.delay(120).springify().damping(18)}
            className="-mt-8 flex-1 rounded-t-[32px] bg-white px-6 pt-3"
            style={{ paddingBottom: insets.bottom + 24 }}
          >
            <View className="mb-6 h-1.5 w-10 self-center rounded-full bg-ink-200" />

            <Animated.View entering={FadeInDown.delay(240).duration(400)} className="mb-6">
              <Text className="mb-2 text-[13px] font-semibold text-ink-700">I want to</Text>
              <SegmentedSwitch options={ROLES} value={role} onChange={setRole} />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
              <Input
                label="Full name"
                icon="person-outline"
                placeholder="Jane Doe"
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                value={form.name}
                error={errors.name}
                onChangeText={set('name')}
              />
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(360).duration(400)}>
              <Input
                ref={emailRef}
                label="Email"
                icon="mail-outline"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                value={form.email}
                error={errors.email}
                onChangeText={set('email')}
              />
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(420).duration(400)}>
              <Input
                ref={passwordRef}
                label="Password"
                icon="lock-closed-outline"
                placeholder="At least 6 characters"
                secure
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
                value={form.password}
                error={errors.password}
                onChangeText={set('password')}
              />
              <PasswordStrength password={form.password} />
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(480).duration(400)}>
              <Input
                ref={confirmRef}
                label="Confirm password"
                icon="shield-checkmark-outline"
                placeholder="Repeat password"
                secure
                textContentType="newPassword"
                returnKeyType="go"
                onSubmitEditing={submit}
                value={form.confirm}
                error={errors.confirm}
                success={passwordsMatch}
                hint={passwordsMatch ? 'Passwords match' : undefined}
                onChangeText={set('confirm')}
              />
            </Animated.View>

            {formError ? (
              <Animated.View
                entering={FadeInDown.springify().damping(14)}
                exiting={FadeOut}
                className="mb-4 flex-row items-center rounded-2xl border border-rose-100 bg-rose-50 p-3.5"
              >
                <View className="h-8 w-8 items-center justify-center rounded-full bg-white">
                  <Ionicons name="alert" size={16} color="#E11D48" />
                </View>
                <Text className="ml-3 flex-1 text-sm font-medium text-danger">{formError}</Text>
              </Animated.View>
            ) : null}

            <Animated.View entering={FadeInDown.delay(540).duration(400)}>
              <Button
                title={role === 'recruiter' ? 'Create recruiter account' : 'Create account'}
                onPress={submit}
                loading={loading}
                className="mt-2"
                iconRight
                icon={<Ionicons name="arrow-forward" size={18} color="#fff" />}
              />
              <LegalLinks prefix="By creating an account you agree to our" className="mt-3 text-center text-xs leading-[18px] text-ink-400" linkClassName="text-ink-500" />
            </Animated.View>

            <View className="flex-1" />

            <Divider label="ALREADY A MEMBER?" />
            <Button title="Sign in instead" variant="outline" onPress={() => router.replace('/(auth)/login')} />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

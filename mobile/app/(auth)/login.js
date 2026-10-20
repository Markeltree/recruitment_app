import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AuthHero from '../../components/AuthHero';
import { Divider } from '../../components/AuthBits';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useAuth } from '../../store/auth';

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const login = useAuth((s) => s.login);
  const passwordRef = useRef(null);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const validate = () => {
    const e = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
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
      await login(form.email.trim(), form.password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  return (
    <View className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView bounces={false} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <AuthHero title={'Welcome\nback 👋'} subtitle="Sign in to pick up your job search where you left off." onBack={() => router.back()} />

          {/* Form sheet slides up over the hero */}
          <Animated.View
            entering={FadeInUp.delay(120).springify().damping(18)}
            className="-mt-8 flex-1 rounded-t-[32px] bg-white px-6 pt-3"
            style={{ paddingBottom: insets.bottom + 24 }}
          >
            <View className="mb-6 h-1.5 w-10 self-center rounded-full bg-ink-200" />

            <Animated.View entering={FadeInDown.delay(260).duration(400)}>
              <Input
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
            <Animated.View entering={FadeInDown.delay(330).duration(400)}>
              <Input
                ref={passwordRef}
                label="Password"
                icon="lock-closed-outline"
                placeholder="Enter your password"
                secure
                autoComplete="password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={submit}
                value={form.password}
                error={errors.password}
                onChangeText={set('password')}
              />
            </Animated.View>

            {formError ? (
              <Animated.View entering={FadeInDown.springify().damping(14)} exiting={FadeOut} className="mb-4 flex-row items-center rounded-2xl border border-rose-100 bg-rose-50 p-3.5">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-white">
                  <Ionicons name="alert" size={16} color="#E11D48" />
                </View>
                <Text className="ml-3 flex-1 text-sm font-medium text-danger">{formError}</Text>
              </Animated.View>
            ) : null}

            <Animated.View entering={FadeInDown.delay(400).duration(400)}>
              <Button
                title="Sign in"
                onPress={submit}
                loading={loading}
                className="mt-2"
                iconRight
                icon={<Ionicons name="arrow-forward" size={18} color="#fff" />}
              />
            </Animated.View>

            <View className="flex-1" />

            <Divider label="NEW TO APPLYUP?" />
            <Button title="Create an account" variant="outline" onPress={() => router.replace('/(auth)/register')} />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

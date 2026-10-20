import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import Input from '../components/Input';
import { ModalHeader } from '../components/ScreenHeader';
import { authApi } from '../lib/api';

export default function ChangePassword() {
  const router = useRouter();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setError('');
    if (form.newPassword.length < 6) return setError('New password must be at least 6 characters');
    if (form.newPassword !== form.confirm) return setError('Passwords do not match');
    setSaving(true);
    try {
      await authApi.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setDone(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ModalHeader
        title="Change password"
        left={
          <Pressable onPress={() => router.back()} hitSlop={8} className="h-8 w-8 items-center justify-center rounded-full bg-ink-100">
            <Ionicons name="close" size={18} color="#334155" />
          </Pressable>
        }
      />
      <ScrollView contentContainerClassName="flex-grow px-5 pt-6" keyboardShouldPersistTaps="handled">
        {done ? (
          <View className="flex-1 items-center justify-center pb-20">
            <Animated.View entering={ZoomIn.duration(400)} className="h-20 w-20 items-center justify-center rounded-full bg-green-50">
              <Ionicons name="checkmark-circle" size={48} color="#16A34A" />
            </Animated.View>
            <Text className="mt-5 text-xl font-bold text-ink-900">Password updated</Text>
            <Text className="mt-2 text-center text-[15px] text-ink-500">Use your new password the next time you sign in.</Text>
            <Button title="Done" onPress={() => router.back()} className="mt-8 w-full" />
          </View>
        ) : (
          <Animated.View entering={FadeInDown.duration(350)}>
            <View className="mb-6 flex-row items-center rounded-2xl border border-brand-100 bg-brand-50 p-4">
              <Ionicons name="shield-checkmark" size={20} color="#2F6BFF" />
              <Text className="ml-3 flex-1 text-sm leading-5 text-ink-700">Choose a strong password with at least 6 characters.</Text>
            </View>
            <Input label="Current password" icon="lock-closed-outline" secure value={form.currentPassword} onChangeText={(v) => setForm({ ...form, currentPassword: v })} />
            <Input label="New password" icon="key-outline" secure value={form.newPassword} onChangeText={(v) => setForm({ ...form, newPassword: v })} />
            <Input label="Confirm new password" icon="shield-checkmark-outline" secure value={form.confirm} onChangeText={(v) => setForm({ ...form, confirm: v })} />
            {error ? (
              <View className="mb-4 flex-row items-center rounded-2xl bg-rose-50 p-3.5">
                <Ionicons name="alert-circle" size={18} color="#E11D48" />
                <Text className="ml-2 flex-1 text-sm font-medium text-danger">{error}</Text>
              </View>
            ) : null}
            <Button title="Update password" onPress={save} loading={saving} className="mt-2" />
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

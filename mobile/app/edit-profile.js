import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import Input from '../components/Input';
import { ModalHeader } from '../components/ScreenHeader';
import { userApi } from '../lib/api';
import { useAuth } from '../store/auth';

function SectionLabel({ children }) {
  return <Text className="mb-3 mt-4 text-xs font-bold uppercase tracking-widest text-ink-400">{children}</Text>;
}

export default function EditProfile() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    headline: user?.headline || '',
    location: user?.location || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    skills: (user?.skills || []).join(', '),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setError('');
    if (form.name.trim().length < 2) return setError('Name must be at least 2 characters');
    setSaving(true);
    try {
      const updated = await userApi.update({
        name: form.name.trim(),
        headline: form.headline.trim(),
        location: form.location.trim(),
        phone: form.phone.trim(),
        bio: form.bio.trim(),
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      updateUser(updated);
      router.back();
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
        title="Edit profile"
        left={<Pressable onPress={() => router.back()} hitSlop={8}><Text className="text-[15px] font-medium text-ink-500">Cancel</Text></Pressable>}
        right={
          <Pressable onPress={save} disabled={saving} hitSlop={8}>
            <Text className={`text-[15px] font-bold ${saving ? 'text-ink-400' : 'text-brand-600'}`}>{saving ? 'Saving…' : 'Save'}</Text>
          </Pressable>
        }
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerClassName="px-5 pb-10" keyboardShouldPersistTaps="handled">
          <View className="items-center py-6">
            <Avatar name={form.name || user?.name} size={80} />
            <Text className="mt-3 text-sm text-ink-500">{user?.email}</Text>
          </View>

          <SectionLabel>Basics</SectionLabel>
          <Input label="Full name" icon="person-outline" autoCapitalize="words" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
          <Input label="Headline" icon="ribbon-outline" placeholder="e.g. Product Designer" autoCapitalize="sentences" value={form.headline} onChangeText={(v) => setForm({ ...form, headline: v })} />
          <Input label="Location" icon="location-outline" placeholder="City, Country" autoCapitalize="words" value={form.location} onChangeText={(v) => setForm({ ...form, location: v })} />
          <Input label="Phone" icon="call-outline" keyboardType="phone-pad" value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} />

          <SectionLabel>Professional</SectionLabel>
          <Input label="Skills" icon="construct-outline" placeholder="React, Figma, SQL" hint="Separate skills with commas" value={form.skills} onChangeText={(v) => setForm({ ...form, skills: v })} />
          <Input
            label="About you"
            multiline
            maxLength={1000}
            autoCapitalize="sentences"
            placeholder="A short summary of your experience and what you are looking for."
            hint={`${form.bio.length}/1000`}
            value={form.bio}
            onChangeText={(v) => setForm({ ...form, bio: v })}
          />

          {error ? (
            <View className="mb-2 flex-row items-center rounded-2xl bg-rose-50 p-3.5">
              <Ionicons name="alert-circle" size={18} color="#E11D48" />
              <Text className="ml-2 flex-1 text-sm font-medium text-danger">{error}</Text>
            </View>
          ) : null}
          <Button title="Save changes" onPress={save} loading={saving} className="mt-4" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

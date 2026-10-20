import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import Input from '../components/Input';
import { ModalHeader } from '../components/ScreenHeader';
import { userApi } from '../lib/api';
import { useAuth } from '../store/auth';

// "github.com/me/app" -> "https://github.com/me/app"
const normaliseLink = (v) => {
  const t = v.trim();
  if (!t) return '';
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
};

export default function PortfolioEdit() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user, updateUser } = useAuth();
  const existing = (user?.portfolio || []).find((p) => p._id === id);

  const [form, setForm] = useState({
    title: existing?.title || '',
    role: existing?.role || '',
    description: existing?.description || '',
    link: existing?.link || '',
    skills: (existing?.skills || []).join(', '),
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const set = (k) => (v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const save = async () => {
    setFormError('');
    const link = normaliseLink(form.link);
    const e = {};
    if (form.title.trim().length < 2) e.title = 'Give the project a title';
    if (link && !/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(link)) e.link = 'Enter a valid link';
    setErrors(e);
    if (Object.keys(e).length) return;

    const body = {
      title: form.title.trim(),
      role: form.role.trim(),
      description: form.description.trim(),
      link,
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
    };
    setSaving(true);
    try {
      const portfolio = existing ? await userApi.updateProject(existing._id, body) : await userApi.addProject(body);
      updateUser({ portfolio });
      router.back();
    } catch (err) {
      setFormError(err.details?.map((d) => d.message).join(' · ') || err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = () =>
    Alert.alert('Delete project', `Remove "${existing.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            updateUser({ portfolio: await userApi.removeProject(existing._id) });
            router.back();
          } catch (err) {
            setFormError(err.message);
          }
        },
      },
    ]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ModalHeader
        title={existing ? 'Edit project' : 'New project'}
        left={
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Text className="text-[15px] font-medium text-ink-500">Cancel</Text>
          </Pressable>
        }
        right={
          <Pressable onPress={save} disabled={saving} hitSlop={8}>
            <Text className={`text-[15px] font-bold ${saving ? 'text-ink-400' : 'text-brand-600'}`}>{saving ? 'Saving…' : 'Save'}</Text>
          </Pressable>
        }
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerClassName="px-5 pb-10 pt-5" keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeInDown.duration(300)}>
            <Input label="Project title" icon="layers-outline" placeholder="e.g. Food delivery app" autoCapitalize="sentences" value={form.title} error={errors.title} onChangeText={set('title')} />
            <Input label="Your role" icon="person-outline" placeholder="e.g. Lead React Native developer" autoCapitalize="sentences" value={form.role} onChangeText={set('role')} />
            <Input
              label="What you did"
              multiline
              maxLength={600}
              autoCapitalize="sentences"
              placeholder="The problem, what you built, and the result."
              hint={`${form.description.length}/600`}
              value={form.description}
              onChangeText={set('description')}
            />
            <Input
              label="Link"
              icon="link-outline"
              placeholder="github.com/you/project or a live URL"
              keyboardType="url"
              autoCorrect={false}
              value={form.link}
              error={errors.link}
              hint="Recruiters open this from your proposal"
              onChangeText={set('link')}
            />
            <Input label="Skills used" icon="construct-outline" placeholder="React Native, Firebase, Figma" hint="Separate with commas" value={form.skills} onChangeText={set('skills')} />

            {formError ? (
              <View className="mb-3 flex-row items-center rounded-2xl bg-rose-50 p-3.5">
                <Ionicons name="alert-circle" size={18} color="#E11D48" />
                <Text className="ml-2 flex-1 text-sm font-medium text-danger">{formError}</Text>
              </View>
            ) : null}

            <Button title={existing ? 'Save changes' : 'Add to portfolio'} onPress={save} loading={saving} className="mt-2" />
            {existing ? <Button title="Delete project" variant="ghost" className="mt-2" onPress={remove} /> : null}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

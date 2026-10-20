import { Alert, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeOutLeft, LinearTransition } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import IconButton from '../components/IconButton';
import PortfolioCard from '../components/PortfolioCard';
import { userApi } from '../lib/api';
import { useAuth } from '../store/auth';

export default function Portfolio() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const projects = user?.portfolio || [];

  const remove = (item) =>
    Alert.alert('Delete project', `Remove "${item.title}" from your portfolio? Proposals you already sent keep their copy.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            updateUser({ portfolio: await userApi.removeProject(item._id) });
          } catch (e) {
            Alert.alert('Could not delete', e.message);
          }
        },
      },
    ]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <StatusBar style="dark" />
      <View className="flex-row items-center px-5 pb-2 pt-2">
        <IconButton icon="chevron-back" label="Back" onPress={() => router.back()} />
        <View className="ml-3 flex-1">
          <Text className="text-xl font-extrabold tracking-tight text-ink-900">Portfolio</Text>
          <Text className="text-xs text-ink-500">{projects.length ? `${projects.length} of 20 projects` : 'Show employers your best work'}</Text>
        </View>
        {projects.length ? <IconButton icon="add" variant="brand" label="Add project" onPress={() => router.push('/portfolio-edit')} /> : null}
      </View>

      <ScrollView contentContainerClassName="flex-grow px-5 pb-10 pt-3" showsVerticalScrollIndicator={false}>
        {projects.length ? (
          <>
            <Animated.View entering={FadeInDown} className="mb-4 flex-row items-center rounded-2xl border border-brand-100 bg-brand-50 p-3.5">
              <Ionicons name="bulb-outline" size={18} color="#2F6BFF" />
              <Text className="ml-2.5 flex-1 text-xs leading-[18px] text-ink-700">
                Attach up to 3 of these to any proposal. Add a live link so recruiters can see the work.
              </Text>
            </Animated.View>
            {projects.map((p, i) => (
              <Animated.View key={p._id} entering={FadeInDown.delay(i * 50).springify().damping(16)} exiting={FadeOutLeft} layout={LinearTransition.springify()}>
                <PortfolioCard item={p} onEdit={() => router.push({ pathname: '/portfolio-edit', params: { id: p._id } })} onDelete={() => remove(p)} />
              </Animated.View>
            ))}
          </>
        ) : (
          <EmptyState icon="layers-outline" title="No projects yet" subtitle="Add projects you've worked on (apps, designs, campaigns) and attach them to your proposals.">
            <Button title="Add your first project" onPress={() => router.push('/portfolio-edit')} icon={<Ionicons name="add" size={18} color="#fff" />} />
          </EmptyState>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

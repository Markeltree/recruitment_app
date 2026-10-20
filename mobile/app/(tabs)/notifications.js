import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, SectionList, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Animated, { Extrapolation, FadeInDown, FadeOut, LinearTransition, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import EmptyState from '../../components/EmptyState';
import PressableScale from '../../components/PressableScale';
import { useScrollHeader } from '../../components/ScreenHeader';
import TabHero, { HeroCompactBar } from '../../components/TabHero';
import { ListSkeleton } from '../../components/Skeleton';
import { notificationsApi } from '../../lib/api';
import { shadow, timeAgo } from '../../constants/theme';
import { useNotifications } from '../../store/notifications';

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);

const typeMeta = {
  application: { icon: 'briefcase', color: '#2F6BFF', bg: '#EEF4FF' },
  match: { icon: 'sparkles', color: '#7C3AED', bg: '#F5F3FF' },
  system: { icon: 'settings', color: '#475569', bg: '#F1F5F9' },
  announcement: { icon: 'megaphone', color: '#C2410C', bg: '#FFF7ED' },
};

// Revealed behind an unread card when it is swiped left
function MarkReadAction({ progress }) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.6], [0, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.6, 1], Extrapolation.CLAMP) }],
  }));
  return (
    <View className="mb-2.5 ml-2 w-24 items-center justify-center rounded-[20px] bg-brand-500">
      <Animated.View style={style} className="items-center">
        <Ionicons name="checkmark-done" size={22} color="#fff" />
        <Text className="mt-1 text-[11px] font-bold text-white">Mark read</Text>
      </Animated.View>
    </View>
  );
}

function UnreadDot() {
  return (
    <View className="ml-2 h-2.5 w-2.5 items-center justify-center">
      <MotiView
        from={{ scale: 1, opacity: 0.6 }}
        animate={{ scale: 2.4, opacity: 0 }}
        transition={{ type: 'timing', duration: 1400, loop: true, repeatReverse: false }}
        style={{ position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: '#2F6BFF' }}
      />
      <View className="h-2 w-2 rounded-full bg-brand-500" />
    </View>
  );
}

export default function Notifications() {
  const setUnread = useNotifications((s) => s.setUnread);
  const { scrollY, onScroll } = useScrollHeader();
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await notificationsApi.list();
      setItems(res.data);
      setUnread(res.unread);
    } finally {
      setRefreshing(false);
      setLoaded(true);
    }
  }, [setUnread]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const markAll = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setItems((prev) => prev.map((x) => ({ ...x, read: true })));
    setUnread(0);
    await notificationsApi.markAllRead().catch(() => {});
    load();
  };

  const markOne = async (n) => {
    if (n.read) return;
    setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
    setUnread(Math.max(0, useNotifications.getState().unread - 1));
    await notificationsApi.markRead(n._id).catch(() => {});
  };

  const sections = useMemo(() => {
    const fresh = items.filter((n) => !n.read);
    const earlier = items.filter((n) => n.read);
    return [fresh.length ? { title: 'New', data: fresh } : null, earlier.length ? { title: 'Earlier', data: earlier } : null].filter(Boolean);
  }, [items]);

  const unreadCount = items.filter((n) => !n.read).length;

  const renderCard = (item) => {
    const meta = typeMeta[item.type] || typeMeta.system;
    return (
      <PressableScale
        onPress={() => markOne(item)}
        scaleTo={0.98}
        className={`mb-2.5 flex-row rounded-[20px] border bg-white p-4 ${item.read ? 'border-line' : 'border-brand-100'}`}
        style={item.read ? null : shadow.sm}
      >
        <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: meta.bg }}>
          <Ionicons name={meta.icon} size={19} color={meta.color} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className={`flex-1 text-[15px] text-ink-900 ${item.read ? 'font-semibold' : 'font-bold'}`} numberOfLines={1}>
              {item.title}
            </Text>
            <Text className="ml-2 text-[11px] font-medium text-ink-400">{timeAgo(item.createdAt)}</Text>
            {!item.read ? <UnreadDot /> : null}
          </View>
          <Text className={`mt-1 text-sm leading-5 ${item.read ? 'text-ink-500' : 'text-ink-700'}`}>{item.body}</Text>
        </View>
      </PressableScale>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <HeroCompactBar title="Alerts" scrollY={scrollY} />
      <AnimatedSectionList
        sections={sections}
        keyExtractor={(n) => n._id}
        onScroll={onScroll}
        scrollEventThrottle={16}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing && loaded} onRefresh={load} tintColor="#2F6BFF" />}
        ListHeaderComponent={
          <View className="mb-3">
            <TabHero
              scrollY={scrollY}
              eyebrow="Inbox"
              title="Alerts"
              subtitle={unreadCount ? `${unreadCount} unread · swipe left to mark read` : 'Updates on your applications'}
              right={
                unreadCount ? (
                  <Animated.View entering={FadeInDown} exiting={FadeOut}>
                    <Pressable onPress={markAll} className="flex-row items-center rounded-full border border-white/25 bg-white/15 px-3 py-2 active:opacity-70">
                      <Ionicons name="checkmark-done" size={15} color="#fff" />
                      <Text className="ml-1 text-xs font-semibold text-white">Mark all read</Text>
                    </Pressable>
                  </Animated.View>
                ) : null
              }
            />
          </View>
        }
        ListEmptyComponent={
          !loaded ? (
            <ListSkeleton />
          ) : (
            <EmptyState icon="notifications-outline" title="You're all set" subtitle="We'll let you know when an employer responds." />
          )
        }
        renderSectionHeader={({ section }) => <Text className="mb-2 mt-2 px-5 text-xs font-bold uppercase tracking-widest text-ink-400">{section.title}</Text>}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(Math.min(index, 8) * 50)
              .springify()
              .damping(16)}
            layout={LinearTransition.springify().damping(18)}
            className="px-5"
          >
            {item.read ? (
              renderCard(item)
            ) : (
              <ReanimatedSwipeable
                friction={1.6}
                rightThreshold={60}
                overshootRight={false}
                renderRightActions={(progress) => <MarkReadAction progress={progress} />}
                onSwipeableOpen={(_, swipeable) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  swipeable.close();
                  markOne(item);
                }}
              >
                {renderCard(item)}
              </ReanimatedSwipeable>
            )}
          </Animated.View>
        )}
      />
    </View>
  );
}

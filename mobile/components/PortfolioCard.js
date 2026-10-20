import { Linking, Pressable, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import PressableScale from './PressableScale';
import { shadow, tintFor } from '../constants/theme';

const hostOf = (link) => {
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return link;
  }
};

/**
 * One portfolio project. With `selectable` the whole card toggles (proposal screen);
 * otherwise it shows edit/delete actions (portfolio screen).
 */
export default function PortfolioCard({ item, selectable, selected, disabled, onPress, onEdit, onDelete }) {
  const tint = tintFor(item.title);

  const body = (
    <>
      <View className="flex-row items-start">
        <View className="h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: tint.bg }}>
          <Ionicons name="layers" size={20} color={tint.fg} />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-[15px] font-bold text-ink-900" numberOfLines={1}>
            {item.title}
          </Text>
          {item.role ? <Text className="mt-0.5 text-xs font-medium text-ink-500">{item.role}</Text> : null}
        </View>
        {selectable ? (
          <Animated.View key={String(selected)} entering={ZoomIn.springify().damping(10)}>
            <Ionicons name={selected ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={selected ? '#2F6BFF' : '#CBD5E1'} />
          </Animated.View>
        ) : (
          <View className="flex-row gap-1">
            <Pressable onPress={onEdit} hitSlop={8} className="h-8 w-8 items-center justify-center rounded-full bg-ink-100" accessibilityLabel="Edit project">
              <Ionicons name="create-outline" size={15} color="#334155" />
            </Pressable>
            <Pressable onPress={onDelete} hitSlop={8} className="h-8 w-8 items-center justify-center rounded-full bg-rose-50" accessibilityLabel="Delete project">
              <Ionicons name="trash-outline" size={15} color="#E11D48" />
            </Pressable>
          </View>
        )}
      </View>

      {item.description ? (
        <Text className="mt-3 text-sm leading-5 text-ink-700" numberOfLines={selectable ? 2 : 4}>
          {item.description}
        </Text>
      ) : null}

      {item.skills?.length || item.link ? (
        <View className="mt-3 flex-row flex-wrap items-center gap-1.5">
          {item.link ? (
            <Pressable
              onPress={() => Linking.openURL(item.link).catch(() => {})}
              hitSlop={6}
              className="flex-row items-center rounded-lg bg-brand-50 px-2 py-1"
            >
              <Ionicons name="link" size={12} color="#1F55E0" />
              <Text className="ml-1 text-xs font-semibold text-brand-700" numberOfLines={1}>
                {hostOf(item.link)}
              </Text>
            </Pressable>
          ) : null}
          {(item.skills || []).slice(0, selectable ? 3 : 8).map((s) => (
            <View key={s} className="rounded-lg bg-ink-100 px-2 py-1">
              <Text className="text-xs font-semibold text-ink-700">{s}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </>
  );

  if (!selectable) {
    return (
      <View className="mb-3 rounded-[22px] border border-line bg-white p-4" style={shadow.sm}>
        {body}
      </View>
    );
  }

  return (
    <PressableScale
      haptic
      scaleTo={0.98}
      onPress={onPress}
      disabled={disabled}
      className={`mb-3 rounded-[22px] border-[1.5px] p-4 ${selected ? 'border-brand-500 bg-brand-50/60' : 'border-line bg-white'}`}
      style={[shadow.sm, disabled ? { opacity: 0.45 } : null]}
    >
      {body}
    </PressableScale>
  );
}

import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PressableScale from './PressableScale';

// Selectable pill (filters, onboarding choices). `count` renders a small trailing number.
export default function Chip({ label, selected, onPress, count, icon }) {
  return (
    <PressableScale
      haptic
      onPress={onPress}
      className={`flex-row items-center rounded-full border px-4 py-2.5 ${selected ? 'border-ink-900 bg-ink-900' : 'border-line bg-white'}`}
    >
      {icon ? <Ionicons name={icon} size={14} color={selected ? '#fff' : '#334155'} style={{ marginRight: 6 }} /> : null}
      <Text className={`text-sm font-semibold capitalize ${selected ? 'text-white' : 'text-ink-700'}`}>{label}</Text>
      {count != null ? (
        <View className={`ml-2 min-w-[20px] items-center rounded-full px-1.5 py-0.5 ${selected ? 'bg-white/20' : 'bg-ink-100'}`}>
          <Text className={`text-[11px] font-bold ${selected ? 'text-white' : 'text-ink-500'}`}>{count}</Text>
        </View>
      ) : null}
    </PressableScale>
  );
}

// Static, non-interactive tag with optional leading icon
export function Tag({ label, icon, tone = 'neutral' }) {
  const tones = {
    neutral: { box: 'bg-ink-100', text: 'text-ink-700', icon: '#64748B' },
    brand: { box: 'bg-brand-50', text: 'text-brand-600', icon: '#2F6BFF' },
    success: { box: 'bg-green-50', text: 'text-green-700', icon: '#16A34A' },
  };
  const t = tones[tone];
  return (
    <View className={`flex-row items-center rounded-lg px-2.5 py-1.5 ${t.box}`}>
      {icon ? <Ionicons name={icon} size={12} color={t.icon} style={{ marginRight: 4 }} /> : null}
      <Text className={`text-xs font-semibold capitalize ${t.text}`}>{label}</Text>
    </View>
  );
}

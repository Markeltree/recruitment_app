import { Text, View } from 'react-native';
import { statusMeta } from '../constants/theme';

export default function StatusBadge({ status }) {
  const meta = statusMeta[status] || statusMeta.applied;
  return (
    <View className={`flex-row items-center rounded-full px-2.5 py-1 ${meta.bg}`}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: meta.dot, marginRight: 6 }} />
      <Text className={`text-xs font-semibold ${meta.text}`}>{meta.label}</Text>
    </View>
  );
}

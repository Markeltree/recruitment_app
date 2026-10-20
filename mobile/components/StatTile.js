import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import AnimatedCounter from './AnimatedCounter';
import { shadow } from '../constants/theme';

// White stat card with tinted icon and a count-up number
export default function StatTile({ icon, color, bg, value, label, delay = 0 }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify().damping(16)} className="flex-1 rounded-[20px] border border-line bg-white p-3.5" style={shadow.md}>
      <View className="h-8 w-8 items-center justify-center rounded-xl" style={{ backgroundColor: bg }}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <AnimatedCounter value={value} className="mt-3 text-2xl font-extrabold tracking-tight text-ink-900" />
      <Text className="text-xs font-medium text-ink-500" numberOfLines={1}>
        {label}
      </Text>
    </Animated.View>
  );
}

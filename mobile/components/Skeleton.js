import { View } from 'react-native';
import { Skeleton as MotiSkeleton } from 'moti/skeleton';

// Shimmering placeholder block for loading states (moti + expo-linear-gradient)
export default function Skeleton({ width = '100%', height = 14, radius = 8, style }) {
  return (
    <View style={style}>
      <MotiSkeleton colorMode="light" colors={['#EDF0F5', '#F7F9FC', '#EDF0F5']} width={width} height={height} radius={radius} />
    </View>
  );
}

// Card-shaped placeholder used by the list screens while their first fetch is in flight
export function ListSkeleton({ count = 4 }) {
  return (
    <View className="px-5">
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} className="mb-3 rounded-[22px] border border-line bg-white p-4">
          <View className="flex-row items-center">
            <Skeleton width={46} height={46} radius={13} />
            <View className="ml-3 flex-1">
              <Skeleton width="70%" height={14} />
              <Skeleton width="40%" height={11} style={{ marginTop: 8 }} />
            </View>
          </View>
          <View className="mt-4 flex-row">
            <Skeleton width={84} height={24} radius={8} />
            <Skeleton width={74} height={24} radius={8} style={{ marginLeft: 8 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { ZoomIn, ZoomOut, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

const ACTIVE = '#2F6BFF';
const INACTIVE = '#94A3B8';

function TabItem({ route, options, focused, onPress, onLongPress }) {
  const bounce = useSharedValue(1);

  useEffect(() => {
    if (focused) bounce.value = withSequence(withSpring(1.22, { damping: 6, stiffness: 400 }), withSpring(1, { damping: 10, stiffness: 220 }));
  }, [focused]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: bounce.value }] }));
  const color = focused ? ACTIVE : INACTIVE;
  const badge = options.tabBarBadge;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={options.title}
      onPress={onPress}
      onLongPress={onLongPress}
      className="flex-1 items-center pt-1"
    >
      <Animated.View style={iconStyle} className="h-8 w-14 items-center justify-center">
        {options.tabBarIcon?.({ focused, color, size: 22 })}
        {badge != null ? (
          <Animated.View
            key={String(badge)}
            entering={ZoomIn.springify().damping(10)}
            exiting={ZoomOut.duration(150)}
            className="absolute right-1.5 top-0 h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-danger px-1"
          >
            <Text className="text-[9px] font-bold text-white">{badge}</Text>
          </Animated.View>
        ) : null}
      </Animated.View>
      <Text style={{ color }} className={`mt-1 text-[11px] ${focused ? 'font-bold' : 'font-medium'}`}>
        {options.title}
      </Text>
    </Pressable>
  );
}

// Bottom tab bar with a spring-animated pill that slides to the active tab
export default function AnimatedTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const [width, setWidth] = useState(0);
  const tabWidth = width / state.routes.length;
  const x = useSharedValue(0);

  useEffect(() => {
    if (tabWidth) x.value = withSpring(state.index * tabWidth, { damping: 18, stiffness: 190, mass: 0.8 });
  }, [state.index, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View
      style={{ paddingBottom: Math.max(insets.bottom, 10), shadowColor: '#0B1220', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: -4 }, elevation: 12 }}
      className="border-t border-line bg-white pt-2"
    >
      <View className="flex-row" onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {tabWidth ? (
          <Animated.View pointerEvents="none" style={[{ position: 'absolute', top: 4, width: tabWidth, alignItems: 'center' }, indicatorStyle]}>
            <View className="h-8 w-14 rounded-full bg-brand-50" />
          </Animated.View>
        ) : null}

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              Haptics.selectionAsync().catch(() => {});
              navigation.navigate(route.name, route.params);
            }
          };
          const onLongPress = () => navigation.emit({ type: 'tabLongPress', target: route.key });

          return <TabItem key={route.key} route={route} options={options} focused={focused} onPress={onPress} onLongPress={onLongPress} />;
        })}
      </View>
    </View>
  );
}

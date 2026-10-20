import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { shadow } from '../constants/theme';

// Local toast state: show({ text, icon, color }) displays a pill for ~1.6s
export function useToast(duration = 1600) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const show = useCallback(
    (t) => {
      clearTimeout(timer.current);
      setToast({ ...t, id: Date.now() });
      timer.current = setTimeout(() => setToast(null), duration);
    },
    [duration]
  );

  useEffect(() => () => clearTimeout(timer.current), []);
  return [toast, show];
}

export default function Toast({ toast, bottom = 16 }) {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom, alignItems: 'center' }}>
      {toast ? (
        <Animated.View
          key={toast.id}
          entering={FadeInDown.springify().damping(16)}
          exiting={FadeOutDown.duration(180)}
          className="flex-row items-center rounded-full bg-ink-900 py-2.5 pl-2.5 pr-4"
          style={shadow.lg}
        >
          <View className="h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: toast.color || '#2F6BFF' }}>
            <Ionicons name={toast.icon || 'checkmark'} size={15} color="#fff" />
          </View>
          <Text className="ml-2.5 text-sm font-semibold text-white">{toast.text}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

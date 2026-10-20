import { Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import PressableScale from './PressableScale';

export const AI_GRADIENT = ['#2F6BFF', '#7C3AED'];

// Sparkle icon that gently pulses; spins continuously while `busy`
export function SparkleIcon({ size = 16, color = '#fff', busy }) {
  return (
    <MotiView
      key={busy ? 'busy' : 'idle'}
      from={busy ? { rotate: '0deg' } : { scale: 0.9 }}
      animate={busy ? { rotate: '360deg' } : { scale: 1.1 }}
      transition={busy ? { type: 'timing', duration: 1200, loop: true, repeatReverse: false } : { type: 'timing', duration: 900, loop: true }}
    >
      <Ionicons name="sparkles" size={size} color={color} />
    </MotiView>
  );
}

// Gradient pill used for every "do it with AI" action
export default function AiButton({ title, onPress, busy, disabled, size = 'md' }) {
  const small = size === 'sm';
  return (
    <PressableScale haptic onPress={onPress} disabled={disabled || busy} style={{ opacity: disabled ? 0.5 : 1 }}>
      <LinearGradient
        colors={AI_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 999,
          paddingHorizontal: small ? 12 : 18,
          height: small ? 32 : 46,
          shadowColor: '#7C3AED',
          shadowOpacity: 0.3,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 5 },
          elevation: 5,
        }}
      >
        <SparkleIcon size={small ? 13 : 16} busy={busy} />
        <Text className={`ml-1.5 font-bold text-white ${small ? 'text-xs' : 'text-[15px]'}`}>{title}</Text>
      </LinearGradient>
    </PressableScale>
  );
}

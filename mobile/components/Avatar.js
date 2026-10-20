import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { initialsOf } from '../constants/theme';

// User avatar: brand gradient with initials, optional white ring for use on colored backgrounds
export default function Avatar({ name, size = 44, ring }) {
  const inner = (
    <LinearGradient
      colors={['#5A8BFF', '#1F55E0']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}
    >
      <Text style={{ color: '#fff', fontSize: size * 0.38, fontWeight: '700' }}>{initialsOf(name)}</Text>
    </LinearGradient>
  );

  if (!ring) return inner;
  return (
    <View style={{ padding: 4, borderRadius: size, backgroundColor: 'rgba(255,255,255,0.25)' }}>
      {inner}
    </View>
  );
}

import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import PressableScale from './PressableScale';
import { shadow } from '../constants/theme';

const variants = {
  surface: { box: 'bg-white border border-line', color: '#0B1220', elevated: true },
  soft: { box: 'bg-ink-100', color: '#0B1220' },
  glass: { box: 'bg-white/20', color: '#FFFFFF' },
  brand: { box: 'bg-brand-50', color: '#2F6BFF' },
};

// Round icon-only button with an optional notification dot
export default function IconButton({ icon, onPress, variant = 'surface', size = 44, iconSize = 20, color, dot, label, haptic = true }) {
  const v = variants[variant];
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      haptic={haptic}
      scaleTo={0.88}
      hitSlop={6}
      className={`items-center justify-center rounded-full ${v.box}`}
      style={[{ width: size, height: size }, v.elevated ? shadow.sm : null]}
    >
      {/* key on icon so a swap (e.g. bookmark -> bookmark-outline) pops in */}
      <Animated.View key={icon} entering={ZoomIn.springify().damping(12)}>
        <Ionicons name={icon} size={iconSize} color={color || v.color} />
      </Animated.View>
      {dot ? (
        <Animated.View entering={ZoomIn} exiting={ZoomOut} className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-danger" />
      ) : null}
    </PressableScale>
  );
}

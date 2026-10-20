import { Image, Text, View } from 'react-native';
import { initialsOf, tintFor } from '../constants/theme';

// Company logo with a tinted-initials fallback. `size` in px.
export default function CompanyLogo({ name, uri, size = 48 }) {
  const radius = Math.round(size * 0.28);

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: radius, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E8ECF3' }}
      />
    );
  }

  const tint = tintFor(name);
  return (
    <View style={{ width: size, height: size, borderRadius: radius, backgroundColor: tint.bg }} className="items-center justify-center">
      <Text style={{ color: tint.fg, fontSize: size * 0.36, fontWeight: '800', letterSpacing: -0.3 }}>{initialsOf(name)}</Text>
    </View>
  );
}

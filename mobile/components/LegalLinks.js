import { Linking, Text } from 'react-native';
import { WEBSITE_URL } from '../constants/config';

export const openLegalPage = (path) => WEBSITE_URL && Linking.openURL(`${WEBSITE_URL}${path}`).catch(() => {});

// "By continuing you agree to our Terms and Privacy Policy." with tappable links
export default function LegalLinks({ prefix, className, linkClassName }) {
  const link = (label, path) =>
    WEBSITE_URL ? (
      <Text className={`font-semibold underline ${linkClassName}`} onPress={() => openLegalPage(path)} suppressHighlighting>
        {label}
      </Text>
    ) : (
      label
    );
  return (
    <Text className={className}>
      {prefix} {link('Terms', '/terms')} and {link('Privacy Policy', '/privacy')}.
    </Text>
  );
}

import { Redirect } from 'expo-router';

// Entry point: the AuthGate in _layout decides where the user goes
export default function Index() {
  return <Redirect href="/(tabs)" />;
}

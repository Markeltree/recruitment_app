import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY = 'applyup_token';

// SecureStore is unavailable on web; fall back to localStorage there.
export const tokenStorage = {
  async get() {
    if (Platform.OS === 'web') return globalThis.localStorage?.getItem(KEY) ?? null;
    return SecureStore.getItemAsync(KEY);
  },
  async set(value) {
    if (Platform.OS === 'web') return globalThis.localStorage?.setItem(KEY, value);
    return SecureStore.setItemAsync(KEY, value);
  },
  async clear() {
    if (Platform.OS === 'web') return globalThis.localStorage?.removeItem(KEY);
    return SecureStore.deleteItemAsync(KEY);
  },
};

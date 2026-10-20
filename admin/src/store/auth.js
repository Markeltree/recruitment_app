import { create } from 'zustand';
import { adminApi, tokenStore } from '../lib/api';

export const useAuth = create((set) => ({
  user: null,
  booting: true,

  bootstrap: async () => {
    if (!tokenStore.get()) return set({ booting: false });
    try {
      const user = await adminApi.me();
      if (user.role !== 'admin') throw new Error('Not an admin');
      set({ user, booting: false });
    } catch {
      tokenStore.clear();
      set({ user: null, booting: false });
    }
  },

  login: async (email, password) => {
    const { token, user } = await adminApi.login({ email, password });
    if (user.role !== 'admin') throw new Error('This account does not have admin access');
    tokenStore.set(token);
    set({ user });
  },

  logout: () => {
    tokenStore.clear();
    set({ user: null });
  },
}));

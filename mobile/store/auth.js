import { create } from 'zustand';
import { authApi, api } from '../lib/api';
import { tokenStorage } from '../lib/storage';

export const useAuth = create((set, get) => ({
  user: null,
  token: null,
  booting: true,

  // Restore session on app start
  bootstrap: async () => {
    try {
      const token = await tokenStorage.get();
      if (!token) return set({ booting: false });
      set({ token });
      const user = await authApi.me();
      set({ user, booting: false });
    } catch {
      await tokenStorage.clear();
      set({ user: null, token: null, booting: false });
    }
  },

  login: async (email, password) => {
    const { token, user } = await authApi.login({ email, password });
    await tokenStorage.set(token);
    set({ token, user });
    return user;
  },

  register: async (payload) => {
    const { token, user } = await authApi.register(payload);
    await tokenStorage.set(token);
    set({ token, user });
    return user;
  },

  updateUser: (patch) => set((s) => ({ user: { ...s.user, ...patch } })),

  logout: async () => {
    await tokenStorage.clear();
    delete api.defaults.headers.common.Authorization;
    set({ user: null, token: null });
  },
}));

// Global hook so the axios interceptor can force logout on 401
globalThis.__applyupOnUnauthorized = () => {
  if (useAuth.getState().token) useAuth.getState().logout();
};

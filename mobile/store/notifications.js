import { create } from 'zustand';

// Lightweight store so the tab badge stays in sync with the Alerts screen
export const useNotifications = create((set) => ({
  unread: 0,
  setUnread: (unread) => set({ unread }),
}));

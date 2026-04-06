import { create } from "zustand";
import { api } from "@/lib/api";
import type { Notification } from "@/types";

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;

  fetchNotifications: (page?: number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  hasMore: false,
  loading: false,
  error: null,

  fetchNotifications: async (page = 1) => {
    set({ loading: true });
    try {
      const res = await api.get<{
        notifications: Notification[];
        total: number;
        page: number;
        has_more: boolean;
      }>(`/api/notifications?page=${page}`);

      if (page === 1) {
        set({ notifications: res.notifications, hasMore: res.has_more });
      } else {
        set((state) => ({
          notifications: [...state.notifications, ...res.notifications],
          hasMore: res.has_more,
        }));
      }
      set({ loading: false });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal memuat notifikasi";
      set({ error: msg, loading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await api.get<{ count: number }>("/api/notifications/unread-count");
      set({ unreadCount: res.count });
    } catch {
      // silent — non-critical
    }
  },

  markRead: async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {
      // silent
    }
  },

  markAllRead: async () => {
    try {
      await api.put("/api/notifications/read-all");
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch {
      // silent
    }
  },
}));

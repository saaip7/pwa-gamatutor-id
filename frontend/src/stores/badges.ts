import { create } from "zustand";
import { api } from "@/lib/api";
import type { Badge } from "@/types";

interface BadgesState {
  badges: Badge[];
  unlockedCount: number;
  loading: boolean;
  error: string | null;

  fetchBadges: () => Promise<void>;
  markDisplayed: (badgeType: string) => Promise<void>;
  undisplayedBadges: () => Badge[];
}

export const useBadgesStore = create<BadgesState>((set, get) => ({
  badges: [],
  unlockedCount: 0,
  loading: false,
  error: null,

  fetchBadges: async () => {
    set({ loading: true });
    try {
      const res = await api.get<{ badges: Badge[] }>("/api/badges");
      const badges = res.badges || [];
      set({
        badges,
        unlockedCount: badges.filter((b) => b.unlocked).length,
        loading: false,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal memuat badges";
      set({ error: msg, loading: false });
    }
  },

  markDisplayed: async (badgeType: string) => {
    try {
      await api.put(`/api/badges/${badgeType}/displayed`, {});
      set((state) => ({
        badges: state.badges.map((b) =>
          b.type === badgeType ? { ...b, displayed: true } : b
        ),
      }));
    } catch {
      // Silent fail — not critical
    }
  },

  undisplayedBadges: () => {
    return get().badges.filter((b) => b.unlocked && !b.displayed);
  },
}));

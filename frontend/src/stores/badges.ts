import { create } from "zustand";
import { api } from "@/lib/api";
import { createCachedFetch } from "@/lib/cache";
import type { Badge } from "@/types";

const BADGE_CACHE_MS = 2 * 60 * 1000;

interface BadgesState {
  badges: Badge[];
  unlockedCount: number;
  loading: boolean;
  error: string | null;

  fetchBadges: () => Promise<void>;
  markDisplayed: (badgeType: string) => Promise<void>;
  undisplayedBadges: () => Badge[];
}

export const useBadgesStore = create<BadgesState>((set, get) => {
  const cachedFetch = createCachedFetch(
    async () => {
      const res = await api.get<{ badges: Badge[] }>("/api/badges");
      return res.badges || [];
    },
    BADGE_CACHE_MS
  );

  return {
    badges: [],
    unlockedCount: 0,
    loading: false,
    error: null,

    fetchBadges: async () => {
      set({ loading: true });
      try {
        const badges = await cachedFetch();
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
      }
    },

    undisplayedBadges: () => {
      return get().badges.filter((b) => b.unlocked && !b.displayed);
    },
  };
});

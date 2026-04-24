import { create } from "zustand";
import { api } from "@/lib/api";
import { createCachedFetch } from "@/lib/cache";
import type { UserPreferences, CharacterData } from "@/types";
import { useAnalyticsStore } from "./analytics";

const PREF_CACHE_MS = 5 * 60 * 1000;

interface PreferencesState {
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;

  fetchPreferences: () => Promise<void>;
  updateNotifications: (data: Record<string, unknown>) => Promise<void>;
  updateTheme: (theme: "light" | "dark" | "auto") => Promise<void>;
  updateOnboarding: (data: { completed?: boolean; step?: number; skipped_tour?: boolean }) => Promise<void>;
  updateFcmToken: (token: string) => Promise<void>;
  useStreakFreeze: () => Promise<void>;
  updateCharacter: (data: Partial<CharacterData>) => Promise<void>;
}

export const usePreferencesStore = create<PreferencesState>((set) => {
  const cachedFetch = createCachedFetch(
    () => api.get<UserPreferences>("/api/preferences"),
    PREF_CACHE_MS
  );

  return {
    preferences: null,
    loading: false,
    error: null,

    fetchPreferences: async () => {
      set({ loading: true });
      try {
        const data = await cachedFetch();
        set({ preferences: data, loading: false });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Gagal memuat preferences";
        set({ error: msg, loading: false });
      }
    },

    updateNotifications: async (data) => {
      await api.put("/api/preferences/notifications", data);
      const updated = await api.get<UserPreferences>("/api/preferences");
      set({ preferences: updated });
    },

    updateTheme: async (theme) => {
      await api.put("/api/preferences/theme", { theme });
      set((state) => ({
        preferences: state.preferences
          ? { ...state.preferences, theme }
          : null,
      }));
    },

    updateOnboarding: async (data) => {
      await api.put("/api/preferences/onboarding", data);
      set((state) => ({
        preferences: state.preferences
          ? {
              ...state.preferences,
              onboarding: { ...state.preferences.onboarding, ...data },
            }
          : null,
      }));
    },

    updateFcmToken: async (token) => {
      await api.put("/api/preferences/fcm-token", { fcm_token: token });
      set((state) => ({
        preferences: state.preferences
          ? { ...state.preferences, fcm_token: token }
          : null,
      }));
    },

    useStreakFreeze: async () => {
      await api.post("/api/preferences/streak/freeze");
      const data = await api.get<UserPreferences>("/api/preferences");
      set({ preferences: data });
      useAnalyticsStore.getState().fetchStreakHistory();
      useAnalyticsStore.getState().fetchStreak();
    },

    updateCharacter: async (data) => {
      await api.put("/api/character/equip", data);
      set((state) => ({
        preferences: state.preferences
          ? {
              ...state.preferences,
              character: state.preferences.character
                ? { ...state.preferences.character, ...data }
                : (data as UserPreferences["character"]),
            }
          : null,
      }));
    },
  };
});

import { create } from "zustand";
import { api } from "@/lib/api";
import type { UserPreferences, CharacterData } from "@/types";

interface PreferencesState {
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;

  fetchPreferences: () => Promise<void>;
  updateNotifications: (data: Partial<UserPreferences["notifications"]>) => Promise<void>;
  updateTheme: (theme: "light" | "dark" | "auto") => Promise<void>;
  updateOnboarding: (data: { completed?: boolean; step?: number }) => Promise<void>;
  updateFcmToken: (token: string) => Promise<void>;
  useStreakFreeze: () => Promise<void>;
  updateCharacter: (data: Partial<CharacterData>) => Promise<void>;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  preferences: null,
  loading: false,
  error: null,

  fetchPreferences: async () => {
    set({ loading: true });
    try {
      const data = await api.get<UserPreferences>("/api/preferences");
      set({ preferences: data, loading: false });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal memuat preferences";
      set({ error: msg, loading: false });
    }
  },

  updateNotifications: async (data) => {
    await api.put("/api/preferences/notifications", data);
    set((state) => ({
      preferences: state.preferences
        ? {
            ...state.preferences,
            notifications: { ...state.preferences.notifications, ...data },
          }
        : null,
    }));
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
    // Refresh preferences to get updated freeze count
    const data = await api.get<UserPreferences>("/api/preferences");
    set({ preferences: data });
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
}));

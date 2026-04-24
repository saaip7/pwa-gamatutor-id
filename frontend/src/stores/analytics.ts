import { create } from "zustand";
import { api } from "@/lib/api";
import { createCachedFetch } from "@/lib/cache";
import type {
  DashboardData,
  ProgressData,
  StrategyEffectivenessResponse,
  ConfidenceTrendResponse,
  StreakData,
  StreakHistoryData,
  ReflectionNote,
} from "@/types";

const CACHE = {
  dashboard: 5 * 60 * 1000,
  progress: 5 * 60 * 1000,
  strategies: 10 * 60 * 1000,
  confidence: 10 * 60 * 1000,
  streak: 5 * 60 * 1000,
  streakHistory: 10 * 60 * 1000,
  notes: 5 * 60 * 1000,
};

interface AnalyticsState {
  dashboard: DashboardData | null;
  progress: ProgressData | null;
  strategies: StrategyEffectivenessResponse | null;
  confidenceTrend: ConfidenceTrendResponse | null;
  streak: StreakData | null;
  streakHistory: StreakHistoryData | null;
  reflectionNotes: ReflectionNote[] | null;
  loading: boolean;
  error: string | null;

  fetchDashboard: () => Promise<void>;
  fetchProgress: () => Promise<void>;
  fetchStrategies: () => Promise<void>;
  fetchConfidenceTrend: (courseName?: string) => Promise<void>;
  fetchStreak: () => Promise<void>;
  fetchStreakHistory: () => Promise<void>;
  fetchReflectionNotes: () => Promise<void>;
  fetchAll: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => {
  const cached = {
    dashboard: createCachedFetch(() => api.get<DashboardData>("/api/analytics/dashboard"), CACHE.dashboard),
    progress: createCachedFetch(() => api.get<ProgressData>("/api/analytics/progress"), CACHE.progress),
    strategies: createCachedFetch(() => api.get<StrategyEffectivenessResponse>("/api/analytics/strategy-effectiveness"), CACHE.strategies),
    streak: createCachedFetch(() => api.get<StreakData>("/api/analytics/streak"), CACHE.streak),
    streakHistory: createCachedFetch(() => api.get<StreakHistoryData>("/api/analytics/streak/history"), CACHE.streakHistory),
    notes: createCachedFetch(async () => {
      const data = await api.get<{ notes: ReflectionNote[] }>("/api/analytics/reflection-notes");
      return data.notes;
    }, CACHE.notes),
  };

  return {
    dashboard: null,
    progress: null,
    strategies: null,
    confidenceTrend: null,
    streak: null,
    streakHistory: null,
    reflectionNotes: null,
    loading: false,
    error: null,

    fetchDashboard: async () => {
      try {
        const data = await cached.dashboard();
        set({ dashboard: data });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Gagal memuat dashboard";
        set({ error: msg });
      }
    },

    fetchProgress: async () => {
      try {
        const data = await cached.progress();
        set({ progress: data });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Gagal memuat progress";
        set({ error: msg });
      }
    },

    fetchStrategies: async () => {
      try {
        const data = await cached.strategies();
        set({ strategies: data });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Gagal memuat strategi";
        set({ error: msg });
      }
    },

    fetchConfidenceTrend: async (courseCode) => {
      try {
        const query = courseCode ? `?course_code=${encodeURIComponent(courseCode)}` : "";
        const data = await api.get<ConfidenceTrendResponse>(
          `/api/analytics/confidence-trend${query}`
        );
        set({ confidenceTrend: data });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Gagal memuat confidence trend";
        set({ error: msg });
      }
    },

    fetchStreak: async () => {
      try {
        const data = await cached.streak();
        set({ streak: data });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Gagal memuat streak";
        set({ error: msg });
      }
    },

    fetchStreakHistory: async () => {
      try {
        const data = await cached.streakHistory();
        set({ streakHistory: data });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Gagal memuat riwayat streak";
        set({ error: msg });
      }
    },

    fetchReflectionNotes: async () => {
      try {
        const data = await cached.notes();
        set({ reflectionNotes: data });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Gagal memuat catatan refleksi";
        set({ error: msg });
      }
    },

    fetchAll: async () => {
      set({ loading: true });
      await Promise.allSettled([
        cached.dashboard().then((data) => set({ dashboard: data })),
        cached.progress().then((data) => set({ progress: data })),
        cached.streak().then((data) => set({ streak: data })),
      ]);
      set({ loading: false });
    },
  };
});

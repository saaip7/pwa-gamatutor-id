import { create } from "zustand";
import { api } from "@/lib/api";
import type {
  DashboardData,
  ProgressData,
  StrategyEffectivenessResponse,
  ConfidenceTrendResponse,
  StreakData,
  StreakHistoryData,
  ReflectionNote,
} from "@/types";

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

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
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
      const data = await api.get<DashboardData>("/api/analytics/dashboard");
      set({ dashboard: data });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal memuat dashboard";
      set({ error: msg });
    }
  },

  fetchProgress: async () => {
    try {
      const data = await api.get<ProgressData>("/api/analytics/progress");
      set({ progress: data });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal memuat progress";
      set({ error: msg });
    }
  },

  fetchStrategies: async () => {
    try {
      const data = await api.get<StrategyEffectivenessResponse>(
        "/api/analytics/strategy-effectiveness"
      );
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
      const data = await api.get<StreakData>("/api/analytics/streak");
      set({ streak: data });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal memuat streak";
      set({ error: msg });
    }
  },

  fetchStreakHistory: async () => {
    try {
      const data = await api.get<StreakHistoryData>("/api/analytics/streak/history");
      set({ streakHistory: data });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal memuat riwayat streak";
      set({ error: msg });
    }
  },

  fetchReflectionNotes: async () => {
    try {
      const data = await api.get<{ notes: ReflectionNote[] }>("/api/analytics/reflection-notes");
      set({ reflectionNotes: data.notes });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal memuat catatan refleksi";
      set({ error: msg });
    }
  },

  fetchAll: async () => {
    set({ loading: true });
    await Promise.allSettled([
      (async () => {
        const data = await api.get<DashboardData>("/api/analytics/dashboard");
        set({ dashboard: data });
      })(),
      (async () => {
        const data = await api.get<ProgressData>("/api/analytics/progress");
        set({ progress: data });
      })(),
      (async () => {
        const data = await api.get<StreakData>("/api/analytics/streak");
        set({ streak: data });
      })(),
    ]);
    set({ loading: false });
  },
}));

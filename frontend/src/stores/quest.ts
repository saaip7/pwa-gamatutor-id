import { create } from "zustand";
import { api } from "@/lib/api";
import { createCachedFetch } from "@/lib/cache";
import type { QuestData, QuestHistoryItem } from "@/types";

const QUEST_CACHE_MS = 2 * 60 * 1000;

interface QuestState {
  quest: QuestData | null;
  history: QuestHistoryItem[];
  loading: boolean;
  error: string | null;

  fetchQuest: () => Promise<void>;
  fetchHistory: (limit?: number) => Promise<void>;
  useQuestFreeze: () => Promise<string | null>;
}

export const useQuestStore = create<QuestState>((set, get) => {
  const cachedFetch = createCachedFetch(
    async () => {
      const res = await api.get<QuestData>("/api/quests/active");
      return res;
    },
    QUEST_CACHE_MS
  );

  return {
    quest: null,
    history: [],
    loading: false,
    error: null,

    fetchQuest: async () => {
      set({ loading: true });
      try {
        const data = await cachedFetch();
        set({ quest: data, loading: false });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Gagal memuat quest";
        set({ error: msg, loading: false });
      }
    },

    fetchHistory: async (limit = 10) => {
      try {
        const data = await api.get<QuestHistoryItem[]>(
          `/api/quests/history?limit=${limit}`
        );
        set({ history: data });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Gagal memuat riwayat quest";
        set({ error: msg });
      }
    },

    useQuestFreeze: async () => {
      try {
        const res = await api.post<{ message: string }>("/api/quests/freeze");
        await get().fetchQuest();
        return res.message;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Gagal menggunakan quest freeze";
        set({ error: msg });
        return null;
      }
    },
  };
});

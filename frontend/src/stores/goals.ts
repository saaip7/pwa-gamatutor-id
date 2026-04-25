import { create } from "zustand";
import { api } from "@/lib/api";
import { createCachedFetch } from "@/lib/cache";
import type { GeneralGoal, TaskGoal, CourseProgress } from "@/types";

const GOALS_CACHE_MS = 2 * 60 * 1000;

interface GoalsState {
  generalGoal: GeneralGoal | null;
  taskGoals: TaskGoal[];
  courses: CourseProgress[];
  loading: boolean;
  error: string | null;

  fetchGoals: () => Promise<void>;
  updateGeneralGoal: (data: GeneralGoal) => Promise<void>;
  updateTaskGoal: (cardId: string, goalText: string) => Promise<void>;
  deleteTaskGoal: (cardId: string) => Promise<void>;
}

export const useGoalsStore = create<GoalsState>((set) => {
  const cachedFetch = createCachedFetch(
    async () => {
      const [goalsRes, coursesRes] = await Promise.all([
        api.get<{
          general: { text_pre: string; text_highlight: string } | null;
          task_goals: TaskGoal[];
        }>("/api/goals"),
        api.get<{
          courses: { course_name: string; completed: number; total: number }[];
        }>("/api/goals/course-progress"),
      ]);

      const generalGoal = goalsRes.general
        ? {
            text_pre: goalsRes.general.text_pre || "",
            text_highlight: goalsRes.general.text_highlight || "",
          }
        : null;

      const courses: CourseProgress[] = (coursesRes.courses || []).map(
        (c, i) => ({
          id: `course-${i}`,
          name: c.course_name,
          completed_tasks: c.completed,
          total_tasks: c.total,
        })
      );

      return { generalGoal, taskGoals: goalsRes.task_goals || [], courses };
    },
    GOALS_CACHE_MS
  );

  return {
    generalGoal: null,
    taskGoals: [],
    courses: [],
    loading: false,
    error: null,

    fetchGoals: async () => {
      set({ loading: true });
      try {
        const data = await cachedFetch();
        set({
          generalGoal: data.generalGoal,
          taskGoals: data.taskGoals,
          courses: data.courses,
          loading: false,
        });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Gagal memuat goals";
        set({ error: msg, loading: false });
      }
    },

    updateGeneralGoal: async (data) => {
      await api.put("/api/goals/general", {
        text_pre: data.text_pre,
        text_highlight: data.text_highlight,
      });
      set({ generalGoal: data });
    },

    updateTaskGoal: async (cardId, goalText) => {
      const taskGoal = await api.put<TaskGoal>(`/api/goals/task/${cardId}`, {
        text: goalText,
      });
      set((state) => ({
        taskGoals: [
          ...state.taskGoals.filter((tg) => tg.card_id !== cardId),
          taskGoal,
        ],
      }));
    },

    deleteTaskGoal: async (cardId) => {
      await api.delete(`/api/goals/task/${cardId}`);
      set((state) => ({
        taskGoals: state.taskGoals.filter((tg) => tg.card_id !== cardId),
      }));
    },
  };
});

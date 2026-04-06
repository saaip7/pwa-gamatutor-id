import { create } from "zustand";
import { api } from "@/lib/api";
import type { GeneralGoal, TaskGoal, CourseProgress } from "@/types";

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

export const useGoalsStore = create<GoalsState>((set) => ({
  generalGoal: null,
  taskGoals: [],
  courses: [],
  loading: false,
  error: null,

  fetchGoals: async () => {
    set({ loading: true });
    try {
      const [goals, courses] = await Promise.all([
        api.get<{ general: { textPre: string; textHighlight: string } | null; taskGoals: TaskGoal[] }>(
          "/api/goals"
        ),
        api.get<{ courses: CourseProgress[] }>("/api/goals/course-progress"),
      ]);

      set({
        generalGoal: goals.general || { textPre: "", textHighlight: "" },
        taskGoals: goals.taskGoals || [],
        courses: courses.courses || [],
        loading: false,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal memuat goals";
      set({ error: msg, loading: false });
    }
  },

  updateGeneralGoal: async (data) => {
    await api.put("/api/goals/general", data);
    set({ generalGoal: data });
  },

  updateTaskGoal: async (cardId, goalText) => {
    const taskGoal = await api.put<TaskGoal>(`/api/goals/${cardId}`, {
      goal_text: goalText,
    });
    set((state) => ({
      taskGoals: [
        ...state.taskGoals.filter((tg) => tg.card_id !== cardId),
        taskGoal,
      ],
    }));
  },

  deleteTaskGoal: async (cardId) => {
    await api.delete(`/api/goals/${cardId}`);
    set((state) => ({
      taskGoals: state.taskGoals.filter((tg) => tg.card_id !== cardId),
    }));
  },
}));

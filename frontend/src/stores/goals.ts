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
      const [goalsRes, coursesRes] = await Promise.all([
        api.get<{
          general: { text_pre: string; text_highlight: string } | null;
          taskGoals: TaskGoal[];
        }>("/api/goals"),
        api.get<{
          courses: { course_name: string; completed: number; total: number }[];
        }>("/api/goals/course-progress"),
      ]);

      // Map BE snake_case → FE camelCase
      const generalGoal = goalsRes.general
        ? {
            textPre: goalsRes.general.text_pre || "",
            textHighlight: goalsRes.general.text_highlight || "",
          }
        : null;

      const courses: CourseProgress[] = (coursesRes.courses || []).map(
        (c, i) => ({
          id: `course-${i}`,
          name: c.course_name,
          completedTasks: c.completed,
          totalTasks: c.total,
        })
      );

      set({
        generalGoal,
        taskGoals: goalsRes.taskGoals || [],
        courses,
        loading: false,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal memuat goals";
      set({ error: msg, loading: false });
    }
  },

  updateGeneralGoal: async (data) => {
    await api.put("/api/goals/general", {
      textPre: data.textPre,
      textHighlight: data.textHighlight,
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
}));

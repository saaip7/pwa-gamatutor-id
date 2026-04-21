import { create } from "zustand";
import { api } from "@/lib/api";

// --- BE response shapes ---

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role?: string;
  created_at: string;
}

export interface AdminLog {
  _id: string;
  user_id: string;
  action_type?: string;
  description?: string;
  created_at: string;
  // populated by BE join if available
  user_name?: string;
}

export interface AdminBadge {
  _id: string;
  user_id: string;
  type: string;
  name: string;
  description?: string;
  unlocked?: boolean;
  unlocked_at?: string;
  displayed?: boolean;
}

export interface AdminGoal {
  _id: string;
  user_id: string;
  text_pre?: string;
  text_highlight?: string;
  card_id?: string;
  goal_text?: string;
  created_at: string;
}

export interface AdminTaskGoal {
  card_id: string;
  task_name: string;
  course_name?: string;
  goal_text: string;
  helpful?: boolean | null;
}

export interface AdminBoardList {
  id: string;
  title: string;
  cards: AdminBoardCard[];
}

export interface AdminBoardCard {
  card_id: string;
  task_name: string;
  course_name?: string;
  description?: string;
  deadline?: string;
  difficulty?: string;
  priority?: string;
  learning_strategy?: string;
  personal_best?: { duration_ms?: number; date?: string } | string;
  pre_test_grade?: number;
  post_test_grade?: number;
  reflection?: {
    q1_strategy?: number;
    q2_confidence?: number;
    q3_improvement?: string;
    q3_alignment?: string;
    notes?: string;
    completed_at?: string;
  };
  goal_check?: { goal_text?: string; helpful?: boolean };
  checklists?: { id: string; title: string; isCompleted: boolean }[];
  created_at?: string;
}

export interface AdminBoard {
  _id: string;
  user_id: string;
  name: string;
  lists: AdminBoardList[];
}

export interface AdminStudySession {
  _id: string;
  user_id: string;
  status: "active" | "completed";
  start_time: string;
  end_time?: string;
  duration?: number;
}

export interface AdminPreferences {
  _id: string;
  user_id: string;
  theme?: "light" | "dark" | "auto";
  notifications?: {
    push_enabled?: boolean;
    smart_reminder_enabled?: boolean;
    social_presence_enabled?: boolean;
    deadline_reminder_enabled?: boolean;
    quiet_hours?: {
      enabled?: boolean;
      start?: string;
      end?: string;
    };
  };
  streak?: {
    current: number;
    longest: number;
    last_active_date?: string;
    freezes_used?: number;
    active_dates: string[];
  };
  onboarding?: {
    completed: boolean;
    step: number;
  };
  character?: {
    gender: "male" | "female";
    equipped: {
      head: string;
      top: string;
      bottom: string;
      special: string | null;
    };
  };
}

export interface AdminUserDetail {
  user: AdminUser;
  preferences: AdminPreferences | null;
  badges: AdminBadge[];
  goals: AdminGoal[];
  task_goals: AdminTaskGoal[];
  board: AdminBoard | null;
  recent_study_sessions: AdminStudySession[];
  total_session_sec: number;
  streak: AdminPreferences["streak"] | null;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

// --- Store state ---

interface AdminState {
  // Users list
  users: AdminUser[];
  usersTotal: number;
  usersPage: number;
  usersPerPage: number;
  usersLoading: boolean;

  // User detail
  userDetail: AdminUserDetail | null;
  userDetailLoading: boolean;

  // Logs
  logs: AdminLog[];
  logsTotal: number;
  logsPage: number;
  logsPerPage: number;
  logsLoading: boolean;

  // Actions
  fetchUsers: (page?: number, search?: string) => Promise<void>;
  fetchUserDetail: (userId: string) => Promise<void>;
  fetchLogs: (page?: number, action?: string, userId?: string) => Promise<void>;
  clearUserDetail: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  users: [],
  usersTotal: 0,
  usersPage: 1,
  usersPerPage: 20,
  usersLoading: false,

  userDetail: null,
  userDetailLoading: false,

  logs: [],
  logsTotal: 0,
  logsPage: 1,
  logsPerPage: 20,
  logsLoading: false,

  fetchUsers: async (page = 1, search = "") => {
    set({ usersLoading: true });
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: "20",
      });
      if (search) params.set("search", search);

      const res = await api.get<PaginatedResponse<AdminUser>>(
        `/admin/users?${params.toString()}`
      );
      set({
        users: res.data,
        usersTotal: res.total,
        usersPage: res.page,
        usersPerPage: res.per_page,
        usersLoading: false,
      });
    } catch {
      set({ usersLoading: false });
    }
  },

  fetchUserDetail: async (userId: string) => {
    set({ userDetailLoading: true });
    try {
      const res = await api.get<AdminUserDetail>(
        `/admin/users/${userId}`
      );
      set({ userDetail: res, userDetailLoading: false });
    } catch {
      set({ userDetailLoading: false });
    }
  },

  fetchLogs: async (page = 1, action = "", userId = "") => {
    set({ logsLoading: true });
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: "20",
      });
      if (action) params.set("action", action);
      if (userId) params.set("user_id", userId);

      const res = await api.get<PaginatedResponse<AdminLog>>(
        `/admin/logs?${params.toString()}`
      );
      set({
        logs: res.data,
        logsTotal: res.total,
        logsPage: res.page,
        logsPerPage: res.per_page,
        logsLoading: false,
      });
    } catch {
      set({ logsLoading: false });
    }
  },

  clearUserDetail: () => set({ userDetail: null }),
}));

// --- Auth & User ---

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
  created_at: string;
}

// --- Board ---

export type ColumnKey = "planning" | "monitoring" | "controlling" | "reflection";

export interface BoardCard {
  id: string;
  task_name: string;
  sub_title?: string;
  course_name?: string;
  description?: string;
  deadline?: string;
  difficulty?: "Hard" | "Medium" | "Easy";
  priority?: "High" | "Medium" | "Low";
  learning_strategy?: string;
  column?: string;
  position?: number;
  pre_test_grade?: number;
  post_test_grade?: number;
  satisfaction_rating?: number;
  personal_best?: { duration_ms?: number; date?: string } | string;
  goal_check?: { goal_text?: string; helpful?: boolean };
  reflection?: {
    q1_strategy?: number | string;
    q2_confidence?: number;
    q3_improvement?: string;
    q4_value?: string;
    completed_at?: string;
  };
  checklists?: { id: string; title: string; isCompleted: boolean }[];
  links?: { id?: string; title: string; url: string }[];
  column_movements?: { from: string; to: string; timestamp: string }[];
  archived?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface BoardList {
  id: string;
  title: string;
  cards: BoardCard[];
}

export interface Board {
  _id: string;
  user_id: string;
  name: string;
  lists: BoardList[];
}

// --- Goals ---

export interface GeneralGoal {
  textPre: string;
  textHighlight: string;
}

export interface TaskGoal {
  card_id: string;
  goal_text: string;
  created_at: string;
}

export interface CourseProgress {
  id: string;
  name: string;
  completedTasks: number;
  totalTasks: number;
}

// --- Analytics ---

export interface DashboardStats {
  streak: number;
  focusHours: number;
  tasksCompleted: number;
  badgesUnlocked: number;
  totalBadges: number;
}

export interface StudyPatterns {
  productiveTime: string;
  productiveDays: string;
}

export interface DashboardData {
  stats: DashboardStats;
  patterns: StudyPatterns;
}

export interface ProgressSummary {
  totalCards: number;
  completedCards: number;
  completionRate: number;
  personalBest: string;
}

export interface TaskDistribution {
  total: number;
  todoPercent: number;
  progPercent: number;
  revPercent: number;
  donePercent: number;
}

export interface ProgressData {
  summary: ProgressSummary;
  taskDistribution: TaskDistribution;
}

export interface StrategyEffectiveness {
  name: string;
  taskCount: number;
  subjective: {
    avgRating: number;
    totalRated: number;
    positivePercent: number;
  };
  objective: {
    avgImprovement: number;
    totalTracked: number;
    isDataInsufficient: boolean;
  };
}

export interface StrategyEffectivenessResponse {
  strategies: StrategyEffectiveness[];
}

export interface ConfidenceDataPoint {
  date: string;
  confidence: number;
  learningGain: number;
}

export interface ConfidenceTrendResponse {
  courseName: string;
  availableCourses: { name: string; dataPoints: number }[];
  dataPoints: ConfidenceDataPoint[];
  trend: "improving" | "stable" | "declining";
}

export interface StreakDay {
  label: string;
  state: "completed" | "freeze" | "today" | "future" | "inactive";
}

export interface StreakData {
  current: number;
  longest: number;
  freezesAvailable: number;
  days: StreakDay[];
}

export interface StreakHistoryData {
  active_dates: string[];
  current: number;
  longest: number;
  freezes_available: number;
}

export interface ReflectionNote {
  card_id: string;
  task_name: string;
  course_code?: string;
  q3_improvement: string;
  completed_at?: string;
  strategy?: string;
}

// --- Badges ---

export interface Badge {
  _id: string;
  type: string;
  name: string;
  category: string;
  shape: string;
  description: string;
  unlocked: boolean;
  unlocked_at?: string;
  displayed?: boolean;
}

export interface BadgesResponse {
  badges: Badge[];
}

// --- Notifications ---

export interface Notification {
  _id: string;
  type: "award" | "social" | "reminder" | "insight";
  title: string;
  description: string;
  read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  page: number;
  has_more: boolean;
}

// --- Preferences ---

export interface NotificationPreferences {
  push_enabled: boolean;
  smart_reminder_enabled: boolean;
  social_presence_enabled: boolean;
  deadline_reminder_enabled: boolean;
  quiet_hours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface UserPreferences {
  theme: "light" | "dark" | "auto";
  notifications: NotificationPreferences;
  onboarding: {
    completed: boolean;
    step: number;
  };
  streak: {
    current: number;
    longest: number;
    last_active_date?: string;
    freezes_used: number;
    active_dates: string[];
  };
  fcm_token?: string;
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

// --- Character ---

export interface CharacterData {
  gender: "male" | "female";
  equipped: {
    head: string;
    top: string;
    bottom: string;
    special: string | null;
  };
}

// --- Study Session ---

export interface StudySession {
  _id: string;
  user_id: string;
  status: "active" | "completed";
  start_time: string;
  end_time?: string;
  duration?: number;
}

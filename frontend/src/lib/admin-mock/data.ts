// Mock data for admin dashboard — will be replaced with real API calls

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  lastActive: string;
  streak: number;
  totalCards: number;
  doneCards: number;
  onboardingDone: boolean;
}

export interface MockCard {
  id: string;
  title: string;
  description: string;
  column: "planning" | "monitoring" | "controlling" | "reflection";
  courseName: string;
  difficulty: number | null;
  reflection: string | null;
  personalBest: number | null;
  goalCheck: "helped" | "neutral" | "not-helped" | null;
  deadline: string | null;
  createdAt: string;
}

export interface MockGoal {
  id: string;
  type: "general" | "course" | "task";
  content: string;
  courseName?: string;
  cardTitle?: string;
  createdAt: string;
}

export interface MockBadge {
  type: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt: string | null;
  displayed: boolean;
}

export interface MockStudySession {
  id: string;
  cardTitle: string;
  startTime: string;
  endTime: string | null;
  durationMin: number | null;
}

export interface MockStreakDay {
  date: string;
  active: boolean;
}

export interface MockPreferences {
  smartReminder: boolean;
  socialPresence: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  theme: "light" | "dark";
  characterGender: "male" | "female";
  equippedItems: Record<string, string>;
}

export interface MockLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  description: string;
  timestamp: string;
}

// --- USERS ---
export const mockUsers: MockUser[] = [
  {
    id: "u1",
    name: "Andi Pratama",
    email: "andi@student.ac.id",
    role: "user",
    createdAt: "2026-03-22T08:00:00Z",
    lastActive: "2026-04-08T14:30:00Z",
    streak: 5,
    totalCards: 12,
    doneCards: 7,
    onboardingDone: true,
  },
  {
    id: "u2",
    name: "Siti Nurhaliza",
    email: "siti.n@student.ac.id",
    role: "user",
    createdAt: "2026-03-23T10:00:00Z",
    lastActive: "2026-04-08T09:15:00Z",
    streak: 12,
    totalCards: 18,
    doneCards: 15,
    onboardingDone: true,
  },
  {
    id: "u3",
    name: "Budi Santoso",
    email: "budi.s@student.ac.id",
    role: "user",
    createdAt: "2026-03-24T07:30:00Z",
    lastActive: "2026-04-06T20:00:00Z",
    streak: 0,
    totalCards: 5,
    doneCards: 1,
    onboardingDone: true,
  },
  {
    id: "u4",
    name: "Dewi Lestari",
    email: "dewi.l@student.ac.id",
    role: "user",
    createdAt: "2026-03-25T14:00:00Z",
    lastActive: "2026-04-07T18:45:00Z",
    streak: 3,
    totalCards: 8,
    doneCards: 4,
    onboardingDone: true,
  },
  {
    id: "u5",
    name: "Rizki Fauzan",
    email: "rizki.f@student.ac.id",
    role: "user",
    createdAt: "2026-03-26T09:00:00Z",
    lastActive: "2026-04-05T11:30:00Z",
    streak: 0,
    totalCards: 3,
    doneCards: 0,
    onboardingDone: false,
  },
  {
    id: "u6",
    name: "Maya Putri",
    email: "maya.p@student.ac.id",
    role: "user",
    createdAt: "2026-03-28T16:00:00Z",
    lastActive: "2026-04-08T16:00:00Z",
    streak: 8,
    totalCards: 14,
    doneCards: 11,
    onboardingDone: true,
  },
  {
    id: "u7",
    name: "Farhan Hakim",
    email: "farhan.h@student.ac.id",
    role: "user",
    createdAt: "2026-04-01T08:00:00Z",
    lastActive: "2026-04-08T12:00:00Z",
    streak: 2,
    totalCards: 6,
    doneCards: 2,
    onboardingDone: true,
  },
  {
    id: "u8",
    name: "Nadia Azzahra",
    email: "nadia.a@student.ac.id",
    role: "user",
    createdAt: "2026-04-02T11:00:00Z",
    lastActive: "2026-04-04T09:00:00Z",
    streak: 0,
    totalCards: 2,
    doneCards: 0,
    onboardingDone: true,
  },
  {
    id: "admin1",
    name: "Admin Researcher",
    email: "admin@univ.ac.id",
    role: "admin",
    createdAt: "2026-03-20T08:00:00Z",
    lastActive: "2026-04-08T17:00:00Z",
    streak: 0,
    totalCards: 0,
    doneCards: 0,
    onboardingDone: true,
  },
];

// --- USER DETAIL (for u2 - Siti, as example power user) ---
export const mockUserCards: MockCard[] = [
  {
    id: "c1",
    title: "Bab 1: Pendahuluan",
    description: "Membaca dan meringkas bab 1 skripsi",
    column: "reflection",
    courseName: "Skripsi",
    difficulty: 3,
    reflection: "Sudah paham alur penulisan, perlu deepen di bagian metodologi",
    personalBest: 85,
    goalCheck: "helped",
    deadline: "2026-04-10T23:59:00Z",
    createdAt: "2026-03-25T10:00:00Z",
  },
  {
    id: "c2",
    title: "Tugas UI/UX Design",
    description: "Mendesain wireframe untuk aplikasi mobile",
    column: "monitoring",
    courseName: "Interaksi Manusia dan Komputer",
    difficulty: 4,
    reflection: null,
    personalBest: null,
    goalCheck: null,
    deadline: "2026-04-12T23:59:00Z",
    createdAt: "2026-03-28T14:00:00Z",
  },
  {
    id: "c3",
    title: "Latihan SQL Join",
    description: "Practice inner join, left join, subquery",
    column: "controlling",
    courseName: "Basis Data",
    difficulty: 2,
    reflection: "Masih bingung subquery correlated",
    personalBest: 70,
    goalCheck: "neutral",
    deadline: null,
    createdAt: "2026-04-01T09:00:00Z",
  },
  {
    id: "c4",
    title: "Presentasi Kelompok",
    description: "Slide + presentasi tentang design patterns",
    column: "planning",
    courseName: "Rekayasa Perangkat Lunak",
    difficulty: null,
    reflection: null,
    personalBest: null,
    goalCheck: null,
    deadline: "2026-04-15T23:59:00Z",
    createdAt: "2026-04-03T11:00:00Z",
  },
  {
    id: "c5",
    title: "Bab 2: Tinjauan Pustaka",
    description: "Literature review untuk framework SDT",
    column: "reflection",
    courseName: "Skripsi",
    difficulty: 4,
    reflection: "Sudah kumpulkan 15 paper, perlu sintesis",
    personalBest: 90,
    goalCheck: "helped",
    deadline: "2026-04-08T23:59:00Z",
    createdAt: "2026-03-26T08:00:00Z",
  },
  {
    id: "c6",
    title: "Quiz Algorithm",
    description: "Dynamic programming quiz persiapan UTS",
    column: "monitoring",
    courseName: "Algoritma dan Pemrograman",
    difficulty: 5,
    reflection: null,
    personalBest: 65,
    goalCheck: null,
    deadline: "2026-04-09T08:00:00Z",
    createdAt: "2026-04-05T07:00:00Z",
  },
];

export const mockUserGoals: MockGoal[] = [
  {
    id: "g1",
    type: "general",
    content: "Lulus semester ini dengan IPK di atas 3.5",
    createdAt: "2026-03-23T10:00:00Z",
  },
  {
    id: "g2",
    type: "course",
    content: "Pahami konsep SDT dan bisa implementasi di desain aplikasi",
    courseName: "Skripsi",
    createdAt: "2026-03-25T08:00:00Z",
  },
  {
    id: "g3",
    type: "course",
    content: "Kuasai SQL join sampai bisa tanpa buka referensi",
    courseName: "Basis Data",
    createdAt: "2026-04-01T09:00:00Z",
  },
  {
    id: "g4",
    type: "task",
    content: "Selesaikan literature review dengan minimal 15 sumber",
    cardTitle: "Bab 2: Tinjauan Pustaka",
    createdAt: "2026-03-26T08:00:00Z",
  },
];

export const mockUserBadges: MockBadge[] = [
  {
    type: "first_task",
    name: "Langkah Pertama",
    description: "Menyelesaikan tugas pertama",
    unlocked: true,
    unlockedAt: "2026-03-25T10:30:00Z",
    displayed: true,
  },
  {
    type: "streak_3",
    name: "Konsisten",
    description: "3 hari berturut-turut aktif",
    unlocked: true,
    unlockedAt: "2026-03-28T08:00:00Z",
    displayed: true,
  },
  {
    type: "streak_7",
    name: "Pebanding",
    description: "7 hari berturut-turut aktif",
    unlocked: true,
    unlockedAt: "2026-04-03T09:00:00Z",
    displayed: true,
  },
  {
    type: "reflect_5",
    name: "Pemikir",
    description: "Menulis 5 refleksi",
    unlocked: true,
    unlockedAt: "2026-04-01T15:00:00Z",
    displayed: false,
  },
  {
    type: "task_10",
    name: "Produktif",
    description: "Menyelesaikan 10 tugas",
    unlocked: true,
    unlockedAt: "2026-04-06T11:00:00Z",
    displayed: false,
  },
  {
    type: "streak_14",
    name: "Tak Terbendung",
    description: "14 hari berturut-turut aktif",
    unlocked: false,
    unlockedAt: null,
    displayed: false,
  },
  {
    type: "goal_5",
    name: "Berorientasi Tujuan",
    description: "Menetapkan 5 goals",
    unlocked: false,
    unlockedAt: null,
    displayed: false,
  },
  {
    type: "study_10h",
    name: "Penjelajah",
    description: "Total 10 jam sesi belajar",
    unlocked: false,
    unlockedAt: null,
    displayed: false,
  },
  {
    type: "all_courses",
    name: "Manajer Ulung",
    description: "Menggunakan semua kolom Kanban",
    unlocked: true,
    unlockedAt: "2026-04-02T10:00:00Z",
    displayed: true,
  },
  {
    type: "comeback",
    name: "Pulang Kembali",
    description: "Kembali aktif setelah 3+ hari tidak aktif",
    unlocked: false,
    unlockedAt: null,
    displayed: false,
  },
];

export const mockUserStudySessions: MockStudySession[] = [
  {
    id: "ss1",
    cardTitle: "Bab 1: Pendahuluan",
    startTime: "2026-03-25T10:00:00Z",
    endTime: "2026-03-25T11:30:00Z",
    durationMin: 90,
  },
  {
    id: "ss2",
    cardTitle: "Bab 2: Tinjauan Pustaka",
    startTime: "2026-03-26T08:00:00Z",
    endTime: "2026-03-26T10:15:00Z",
    durationMin: 135,
  },
  {
    id: "ss3",
    cardTitle: "Latihan SQL Join",
    startTime: "2026-04-01T09:00:00Z",
    endTime: "2026-04-01T09:45:00Z",
    durationMin: 45,
  },
  {
    id: "ss4",
    cardTitle: "Bab 2: Tinjauan Pustaka",
    startTime: "2026-04-02T14:00:00Z",
    endTime: "2026-04-02T16:30:00Z",
    durationMin: 150,
  },
  {
    id: "ss5",
    cardTitle: "Quiz Algorithm",
    startTime: "2026-04-05T07:00:00Z",
    endTime: "2026-04-05T08:30:00Z",
    durationMin: 90,
  },
  {
    id: "ss6",
    cardTitle: "Tugas UI/UX Design",
    startTime: "2026-04-06T13:00:00Z",
    endTime: null,
    durationMin: null,
  },
];

export const mockUserStreak: MockStreakDay[] = (() => {
  // Generate 3 months of data: Feb, Mar, Apr 2026
  const days: MockStreakDay[] = [];
  const activeDates = new Set([
    // Feb 2026
    "2026-02-02","2026-02-03","2026-02-04","2026-02-05","2026-02-09","2026-02-10","2026-02-11",
    "2026-02-16","2026-02-17","2026-02-18","2026-02-23","2026-02-24","2026-02-25","2026-02-26",
    // Mar 2026
    "2026-03-02","2026-03-03","2026-03-04","2026-03-05","2026-03-06","2026-03-09","2026-03-10",
    "2026-03-11","2026-03-12","2026-03-16","2026-03-17","2026-03-18","2026-03-23","2026-03-24",
    "2026-03-25","2026-03-26","2026-03-30","2026-03-31",
    // Apr 2026
    "2026-04-01","2026-04-02","2026-04-03","2026-04-06","2026-04-07","2026-04-08",
  ]);
  for (let m = 1; m <= 4; m++) {
    const year = 2026;
    const month = m;
    if (month > 4) break;
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ date: dateStr, active: activeDates.has(dateStr) });
    }
  }
  return days;
})();

export const mockUserPreferences: MockPreferences = {
  smartReminder: true,
  socialPresence: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00",
  theme: "light",
  characterGender: "female",
  equippedItems: {
    head: "head_02",
    top: "top_01",
    bottom: "bottom_03",
  },
};

// --- COURSES ---
export interface MockCourse {
  id: string;
  courseCode: string;
  courseName: string;
  createdAt: string;
}

export const mockCourses: MockCourse[] = [
  { id: "co1", courseCode: "CS101", courseName: "Algoritma dan Pemrograman", createdAt: "2026-03-20T08:00:00Z" },
  { id: "co2", courseCode: "CS201", courseName: "Basis Data", createdAt: "2026-03-20T08:00:00Z" },
  { id: "co3", courseCode: "CS301", courseName: "Rekayasa Perangkat Lunak", createdAt: "2026-03-20T08:00:00Z" },
  { id: "co4", courseCode: "CS401", courseName: "Interaksi Manusia dan Komputer", createdAt: "2026-03-20T08:00:00Z" },
  { id: "co5", courseCode: "SK499", courseName: "Skripsi", createdAt: "2026-03-20T08:00:00Z" },
  { id: "co6", courseCode: "MA101", courseName: "Matematika Diskrit", createdAt: "2026-03-22T10:00:00Z" },
];

// --- LEARNING STRATEGIES ---
export interface MockStrategy {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export const mockStrategies: MockStrategy[] = [
  { id: "ls1", name: "Pomodoro Technique", description: "Belajar 25 menit, istirahat 5 menit, secara berulang", createdAt: "2026-03-20T08:00:00Z" },
  { id: "ls2", name: "Spaced Repetition", description: "Mengulang materi dengan jeda waktu yang makin lama", createdAt: "2026-03-20T08:00:00Z" },
  { id: "ls3", name: "Active Recall", description: "Menguji diri sendiri tanpa melihat catatan", createdAt: "2026-03-20T08:00:00Z" },
  { id: "ls4", name: "Feynman Technique", description: "Menjelaskan konsep seolah mengajarkan ke orang lain", createdAt: "2026-03-20T08:00:00Z" },
  { id: "ls5", name: "Mind Mapping", description: "", createdAt: "2026-03-22T10:00:00Z" },
];

// --- LOGS ---
export const mockLogs: MockLog[] = [
  { id: "l1", userId: "u2", userName: "Siti Nurhaliza", action: "login", description: "User logged in", timestamp: "2026-04-08T09:15:00Z" },
  { id: "l2", userId: "u2", userName: "Siti Nurhaliza", action: "card_done", description: 'Completed "Bab 2: Tinjauan Pustaka"', timestamp: "2026-04-08T10:30:00Z" },
  { id: "l3", userId: "u1", userName: "Andi Pratama", action: "login", description: "User logged in", timestamp: "2026-04-08T14:30:00Z" },
  { id: "l4", userId: "u6", userName: "Maya Putri", action: "badge_unlock", description: 'Unlocked badge "Produktif"', timestamp: "2026-04-08T11:00:00Z" },
  { id: "l5", userId: "u6", userName: "Maya Putri", action: "session_start", description: 'Started study session for "Tugas UI/UX"', timestamp: "2026-04-08T13:00:00Z" },
  { id: "l6", userId: "u7", userName: "Farhan Hakim", action: "login", description: "User logged in", timestamp: "2026-04-08T12:00:00Z" },
  { id: "l7", userId: "u4", userName: "Dewi Lestari", action: "reflection", description: 'Wrote reflection on "Latihan SQL Join"', timestamp: "2026-04-07T18:45:00Z" },
  { id: "l8", userId: "u2", userName: "Siti Nurhaliza", action: "streak_freeze", description: "Used streak freeze", timestamp: "2026-04-07T23:50:00Z" },
  { id: "l9", userId: "u3", userName: "Budi Santoso", action: "login", description: "User logged in", timestamp: "2026-04-06T20:00:00Z" },
  { id: "l10", userId: "u1", userName: "Andi Pratama", action: "card_move", description: 'Moved "Tugas UI/UX Design" to Monitoring', timestamp: "2026-04-06T15:00:00Z" },
  { id: "l11", userId: "u6", userName: "Maya Putri", action: "session_end", description: "Study session ended (120 min)", timestamp: "2026-04-07T15:00:00Z" },
  { id: "l12", userId: "u2", userName: "Siti Nurhaliza", action: "goal_set", description: 'Set task goal for "Quiz Algorithm"', timestamp: "2026-04-05T07:30:00Z" },
  { id: "l13", userId: "u5", userName: "Rizki Fauzan", action: "register", description: "New account created", timestamp: "2026-03-26T09:00:00Z" },
  { id: "l14", userId: "u5", userName: "Rizki Fauzan", action: "login", description: "User logged in", timestamp: "2026-04-05T11:30:00Z" },
  { id: "l15", userId: "u8", userName: "Nadia Azzahra", action: "register", description: "New account created", timestamp: "2026-04-02T11:00:00Z" },
];

// --- ANALYTICS ---
export interface MockAnalyticsPoint {
  week: string;
  confidence: number;
  completion: number;
  sessions: number;
}

export const mockUserAnalytics: MockAnalyticsPoint[] = [
  { week: "W1 Mar", confidence: 45, completion: 8, sessions: 3 },
  { week: "W2 Mar", confidence: 50, completion: 15, sessions: 4 },
  { week: "W3 Mar", confidence: 48, completion: 22, sessions: 3 },
  { week: "W4 Mar", confidence: 58, completion: 35, sessions: 5 },
  { week: "W1 Apr", confidence: 62, completion: 44, sessions: 6 },
  { week: "W2 Apr", confidence: 70, completion: 58, sessions: 5 },
];

export interface MockStrategyUsage {
  strategy: string;
  usageCount: number;
  avgConfidence: number;
}

export const mockStrategyUsage: MockStrategyUsage[] = [
  { strategy: "Pomodoro", usageCount: 12, avgConfidence: 72 },
  { strategy: "Active Recall", usageCount: 8, avgConfidence: 68 },
  { strategy: "Spaced Repetition", usageCount: 6, avgConfidence: 75 },
  { strategy: "Feynman Technique", usageCount: 4, avgConfidence: 65 },
  { strategy: "Mind Mapping", usageCount: 3, avgConfidence: 60 },
];

// --- HELPERS ---
export function getUserDetail(id: string) {
  const user = mockUsers.find((u) => u.id === id);
  if (!user) return null;

  // For now all detail data uses u2's mock data; in real app fetched per user
  return {
    user,
    cards: mockUserCards,
    goals: mockUserGoals,
    badges: mockUserBadges,
    studySessions: mockUserStudySessions,
    streak: mockUserStreak,
    preferences: mockUserPreferences,
    analytics: mockUserAnalytics,
    strategyUsage: mockStrategyUsage,
  };
}

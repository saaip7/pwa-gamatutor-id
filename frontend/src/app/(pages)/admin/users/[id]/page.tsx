"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Users,
  LayoutGrid,
  Target,
  Award,
  Clock,
  Flame,
  Settings,
  Calendar,
  CheckCircle2,
  Lock,
  Moon,
  Sun,
  Bell,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Loader2,
  BookOpen,
  Timer,
  } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAdminStore } from "@/stores/admin";
import type {
  AdminUser,
  AdminBadge,
  AdminGoal,
  AdminTaskGoal,
  AdminBoard,
  AdminStudySession,
  AdminPreferences,
  AdminUserDetail,
  AdminBoardCard,
} from "@/stores/admin";

// --- Types ---
type TabKey = "profile" | "board" | "goals" | "badges" | "sessions" | "analytics" | "streak" | "prefs";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "profile", label: "Profil", icon: User },
  { key: "board", label: "Board", icon: LayoutGrid },
  { key: "goals", label: "Goals", icon: Target },
  { key: "badges", label: "Badges", icon: Award },
  { key: "sessions", label: "Sessions", icon: Clock },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "streak", label: "Streak", icon: Flame },
  { key: "prefs", label: "Prefs", icon: Settings },
];

// --- Formatters ---
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}
function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
function fmtDuration(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}j ${m}m` : `${h} jam`;
}

// --- Column metadata ---
const COL: Record<string, { label: string; color: string; bg: string; light: string }> = {
  planning:    { label: "Planning",    color: "#2da5d8", bg: "rgba(140,210,255,0.18)", light: "#e8f6fd" },
  monitoring:  { label: "Monitoring",  color: "#246BDF", bg: "rgba(36,107,223,0.12)",  light: "#eef3fd" },
  controlling: { label: "Controlling", color: "#d97706", bg: "rgba(245,158,11,0.12)",  light: "#fef9ee" },
  reflection:  { label: "Reflection",  color: "#059669", bg: "rgba(16,185,129,0.12)",  light: "#ecfdf5" },
};

// Map board list id/title to column key
const LIST_ID_TO_COL: Record<string, string> = {
  list1: "planning",
  list2: "monitoring",
  list3: "controlling",
  list4: "reflection",
};

// --- Layout helpers (inline styles for Tailwind v4 safety) ---
const col = (gap: number): React.CSSProperties => ({ display: "flex", flexDirection: "column", gap: `${gap}px` });
const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" };

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="rounded-lg border border-neutral-200" style={{ background: "#fff", overflow: "hidden", ...style }}>
      {children}
    </div>
  );
}

function ListRow({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{ borderBottom: last ? "none" : "1px solid #f3f4f6" }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-semibold text-neutral-700" style={{ letterSpacing: "0.01em" }}>
      {children}
    </p>
  );
}

// ========== PROFILE TAB ==========

function ProfileTab({ user, preferences, streak }: { user: AdminUser; preferences: AdminPreferences | null; streak: AdminUserDetail["streak"] }) {
  const totalCards = 0;
  const doneCards = 0;
  const pct = 0;

  return (
    <div style={col(16)}>
      <Card>
        {([
          ["Nama", user.name],
          ["Email", user.email],
          ["Role", user.role || "user"],
          ["Bergabung", fmtDate(user.created_at)],
          ["Onboarding", preferences?.onboarding?.completed ? "Selesai" : "Belum"],
        ] as const).map(([label, value], i, arr) => (
          <ListRow key={label} last={i === arr.length - 1}>
            <span className="text-sm text-neutral-500">{label}</span>
            <span className="text-sm font-medium text-neutral-800">{value}</span>
          </ListRow>
        ))}
      </Card>

      <div style={grid2}>
        <Card>
          <div className="p-4">
            <p className="text-sm text-neutral-500">Streak Aktif</p>
            <div className="flex items-center gap-2 mt-1.5">
              <Flame className="w-5 h-5" style={{ color: "#f59e0b" }} />
              <span className="text-2xl font-bold text-neutral-800">{streak?.current ?? 0}</span>
              <span className="text-sm text-neutral-400 mb-0.5">hari</span>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-neutral-500">Streak Terpanjang</p>
            <div className="flex items-center gap-2 mt-1.5">
              <Flame className="w-5 h-5" style={{ color: "#f59e0b" }} />
              <span className="text-2xl font-bold text-neutral-800">{streak?.longest ?? 0}</span>
              <span className="text-sm text-neutral-400 mb-0.5">hari</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ========== BOARD TAB ==========

function fmtPB(pb: AdminBoardCard["personal_best"]): string | null {
  if (!pb) return null;
  if (typeof pb === "string") return pb;
  const ms = pb.duration_ms ?? 0;
  if (ms === 0) return null;
  const m = Math.round(ms / 60000);
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h > 0 ? `${h}j ${r}m` : `${m}m`;
}

const PRI_COLOR: Record<string, string> = { high: "#dc2626", medium: "#d97706", low: "#6b7280" };
const PRI_LABEL: Record<string, string> = { high: "High", medium: "Med", low: "Low" };
const DIF_COLOR: Record<string, string> = { hard: "#dc2626", medium: "#d97706", easy: "#059669", very_easy: "#6b7280" };
const DIF_LABEL: Record<string, string> = { hard: "Hard", medium: "Med", easy: "Easy", very_easy: "V.Easy" };

function BoardTab({ board }: { board: AdminBoard | null }) {
  const columns = useMemo(() => {
    const groups: Record<string, { title: string; cards: NonNullable<AdminBoard["lists"]>[number]["cards"] }> = {
      planning: { title: "Planning", cards: [] },
      monitoring: { title: "Monitoring", cards: [] },
      controlling: { title: "Controlling", cards: [] },
      reflection: { title: "Reflection", cards: [] },
    };
    if (board?.lists) {
      for (const list of board.lists) {
        const colKey = LIST_ID_TO_COL[list.id] || list.id;
        if (groups[colKey]) groups[colKey].cards = list.cards || [];
      }
    }
    return groups;
  }, [board]);

  return (
    <div style={col(20)}>
      {!board && (
        <p className="text-sm text-neutral-400 text-center py-8">Belum ada board</p>
      )}
      {Object.entries(columns).map(([colKey, { cards: colCards }]) => {
        const meta = COL[colKey];
        return (
          <div key={colKey} style={col(10)}>
            {/* Column header */}
            <div
              className="rounded-lg px-4 py-2.5 flex items-center justify-between"
              style={{ background: meta.light }}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                <span className="text-sm font-semibold" style={{ color: meta.color }}>{meta.label}</span>
              </div>
              <span className="text-xs font-medium text-neutral-400">{colCards.length}</span>
            </div>

            {colCards.length === 0 ? (
              <p className="text-sm text-neutral-300 text-center py-4">Kosong</p>
            ) : (
              <div style={col(8)}>
                {colCards.map((card) => {
                  const pb = fmtPB(card.personal_best);
                  const ref = card.reflection;
                  const hasRef = ref?.q1_strategy || ref?.q2_confidence || ref?.q3_improvement;
                  const hasGrades = card.pre_test_grade != null || card.post_test_grade != null;
                  const gradeDelta = (card.pre_test_grade != null && card.post_test_grade != null && (card.pre_test_grade ?? 0) > 0)
                    ? Math.round(((card.post_test_grade! - card.pre_test_grade!) / card.pre_test_grade!) * 100)
                    : null;

                  return (
                    <Card key={card.card_id}>
                      <div className="p-4" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>

                        {/* Title + priority/difficulty */}
                        <div className="flex items-start justify-between" style={{ gap: "10px" }}>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-neutral-800 leading-snug">{card.task_name}</p>
                            {card.course_name && (
                              <p className="text-xs text-neutral-400 mt-0.5">{card.course_name}</p>
                            )}
                          </div>
                          <div className="flex items-center shrink-0" style={{ gap: "4px" }}>
                            {card.priority && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{
                                background: `${PRI_COLOR[card.priority]}14`,
                                color: PRI_COLOR[card.priority],
                              }}>
                                {PRI_LABEL[card.priority]}
                              </span>
                            )}
                            {card.difficulty && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{
                                background: `${DIF_COLOR[card.difficulty]}14`,
                                color: DIF_COLOR[card.difficulty],
                              }}>
                                {DIF_LABEL[card.difficulty]}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        {card.description && (
                          <p className="text-sm text-neutral-500 leading-relaxed">{card.description}</p>
                        )}

                        {/* Metadata: strategy · PB · deadline */}
                        <div className="flex flex-wrap items-center text-sm" style={{ gap: "12px" }}>
                          {card.learning_strategy && (
                            <span className="flex items-center gap-1.5 font-medium text-neutral-600">
                              <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
                              {card.learning_strategy}
                            </span>
                          )}
                          {pb && (
                            <span className="flex items-center gap-1.5 font-medium" style={{ color: "#059669" }}>
                              <Timer className="w-3.5 h-3.5" style={{ opacity: 0.7 }} />
                              {pb}
                            </span>
                          )}
                          {card.deadline && (
                            <span className="flex items-center gap-1.5 text-neutral-400">
                              <Calendar className="w-3.5 h-3.5" />
                              {fmtDate(card.deadline)}
                            </span>
                          )}
                        </div>

                        {/* Grades */}
                        {hasGrades && (
                          <div className="flex items-center text-sm" style={{ gap: "8px" }}>
                            <span className="text-neutral-400">Nilai</span>
                            <span className="font-semibold text-neutral-700">{card.pre_test_grade ?? "—"}</span>
                            <span className="text-neutral-300">→</span>
                            <span className="font-semibold text-neutral-700">{card.post_test_grade ?? "—"}</span>
                            {gradeDelta != null && (
                              <span className="font-semibold" style={{
                                color: gradeDelta >= 0 ? "#059669" : "#dc2626",
                              }}>
                                {gradeDelta >= 0 ? "+" : ""}{gradeDelta}%
                              </span>
                            )}
                          </div>
                        )}

                        {/* Reflection */}
                        {hasRef && (
                          <div className="rounded-lg p-3" style={{ background: "#f9fafb" }}>
                            <div className="flex items-center flex-wrap" style={{ gap: "16px" }}>
                              {ref?.q1_strategy != null && (
                                <span className="flex items-center text-sm" style={{ gap: "6px" }}>
                                  <span className="text-neutral-400">Efektivitas</span>
                                  <span className="font-semibold text-neutral-700">{ref.q1_strategy}/5</span>
                                </span>
                              )}
                              {ref?.q2_confidence != null && (
                                <span className="flex items-center text-sm" style={{ gap: "6px" }}>
                                  <span className="text-neutral-400">Confidence</span>
                                  <span className="font-semibold text-neutral-700">{ref.q2_confidence}/5</span>
                                </span>
                              )}
                            </div>
                            {ref?.q3_improvement && (
                              <p className="text-sm text-neutral-500 leading-relaxed mt-2">{ref.q3_improvement}</p>
                            )}
                          </div>
                        )}

                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ========== GOALS TAB ==========

function GoalsTab({ goals, taskGoals }: { goals: AdminGoal[]; taskGoals: AdminTaskGoal[] }) {
  return (
    <div style={col(20)}>
      {/* General Goals (from goals collection) */}
      <div style={col(8)}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{ background: "rgba(59,130,246,0.1)" }}
          >
            <Target className="w-3.5 h-3.5" style={{ color: "#3B82F6" }} />
          </div>
          <SectionLabel>General Goals</SectionLabel>
          <span className="text-sm text-neutral-400">{goals.length}</span>
        </div>
        {goals.length === 0 ? (
          <p className="text-sm text-neutral-400 py-3 text-center">Belum ada</p>
        ) : (
          <Card>
            {goals.map((goal, i) => {
              const content = goal.goal_text || [goal.text_pre, goal.text_highlight].filter(Boolean).join(" ");
              return (
                <ListRow key={goal._id} last={i === goals.length - 1}>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-neutral-800">{content}</p>
                  </div>
                  <span className="text-sm text-neutral-400 shrink-0 ml-3">{fmtDate(goal.created_at)}</span>
                </ListRow>
              );
            })}
          </Card>
        )}
      </div>

      {/* Task Goals (from cards' goal_check field) */}
      <div style={col(8)}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{ background: "rgba(5,150,105,0.1)" }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#059669" }} />
          </div>
          <SectionLabel>Task Goals</SectionLabel>
          <span className="text-sm text-neutral-400">{taskGoals.length}</span>
        </div>
        {taskGoals.length === 0 ? (
          <p className="text-sm text-neutral-400 py-3 text-center">Belum ada</p>
        ) : (
          <Card>
            {taskGoals.map((tg, i) => (
              <ListRow key={tg.card_id} last={i === taskGoals.length - 1}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-neutral-800">{tg.goal_text}</p>
                  <p className="text-sm text-neutral-400 mt-0.5">
                    {tg.task_name}{tg.course_name ? ` — ${tg.course_name}` : ""}
                  </p>
                </div>
                {tg.helpful != null && (
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded shrink-0 ml-3"
                    style={{
                      background: tg.helpful ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                      color: tg.helpful ? "#059669" : "#dc2626",
                    }}
                  >
                    {tg.helpful ? "Membantu" : "Kurang membantu"}
                  </span>
                )}
              </ListRow>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}

// ========== BADGES TAB ==========

function BadgesTab({ badges }: { badges: AdminBadge[] }) {
  const unlockedCount = badges.filter((b) => b.unlocked).length;
  return (
    <div style={col(16)}>
      <div className="flex items-center gap-2">
        <span
          className="text-sm font-semibold px-2.5 py-1 rounded"
          style={{ background: "#fef3c7", color: "#92400e" }}
        >
          {unlockedCount} / {badges.length} Unlocked
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
        {badges.map((badge) => (
          <div
            key={badge._id || badge.type || badge.name}
            className="rounded-lg border p-4"
            style={{
              background: badge.unlocked ? "#fff" : "#f9fafb",
              borderColor: badge.unlocked ? "#e5e7eb" : "#f3f4f6",
              opacity: badge.unlocked ? 1 : 0.5,
            }}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: badge.unlocked ? "#fef3c7" : "#e5e7eb",
                  color: badge.unlocked ? "#92400e" : "#9ca3af",
                }}
              >
                {badge.unlocked ? <Award className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              </div>
              <span className={cn("text-sm font-semibold", badge.unlocked ? "text-neutral-800" : "text-neutral-400")}>
                {badge.name}
              </span>
            </div>
            <p className="text-sm text-neutral-500 leading-relaxed">{badge.description}</p>
            {badge.unlocked && badge.unlocked_at && (
              <p className="text-sm text-neutral-400 mt-2">{fmtDate(badge.unlocked_at)}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ========== SESSIONS TAB ==========

function SessionsTab({ sessions, totalSessionSec, totalSessionSecValid, totalSessionsOrphan }: { 
  sessions: AdminStudySession[]; 
  totalSessionSec: number;
  totalSessionSecValid: number;
  totalSessionsOrphan: number;
}) {
  const totalMin = Math.round(totalSessionSec / 60);
  const validMin = Math.round(totalSessionSecValid / 60);
  return (
    <div style={col(16)}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card>
          <div className="p-4">
            <p className="text-sm text-neutral-500">Total Sessions</p>
            <p className="text-2xl font-bold text-neutral-800 mt-1">{sessions.length}</p>
            {totalSessionsOrphan > 0 && (
              <p className="text-xs text-neutral-400 mt-1">{totalSessionsOrphan} orphan</p>
            )}
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-neutral-500">Total Waktu (Valid)</p>
            <p className="text-2xl font-bold text-neutral-800 mt-1">{fmtDuration(validMin)}</p>
            {totalSessionsOrphan > 0 && (
              <p className="text-xs text-neutral-400 mt-1">All: {fmtDuration(totalMin)}</p>
            )}
          </div>
        </Card>
      </div>

      <Card>
        {sessions.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-neutral-400">Belum ada sesi</div>
        )}
        {sessions.map((s, i) => (
          <ListRow key={s._id} last={i === sessions.length - 1}>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-neutral-800">
                  {s.status === "active" ? "Sesi Aktif" : "Sesi Selesai"}
                </p>
                <span className="text-[11px] font-mono text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                  {s._id.length > 8 ? s._id.slice(0, 8) : s._id}
                </span>
              </div>
              <p className="text-sm text-neutral-400 mt-0.5">{fmtDateTime(s.start_time)}</p>
            </div>
            <div className="shrink-0 ml-3">
              {s.status === "active" ? (
                <span
                  className="text-sm font-medium px-2.5 py-1 rounded"
                  style={{ background: "#fef3c7", color: "#92400e" }}
                >
                  Aktif
                </span>
              ) : s.duration ? (
                <span className="text-sm font-semibold" style={{ color: "#3B82F6" }}>
                  {fmtDuration(Math.round(s.duration / 60))}
                </span>
              ) : (
                <span className="text-sm text-neutral-400">—</span>
              )}
            </div>
          </ListRow>
        ))}
      </Card>
    </div>
  );
}

// ========== ANALYTICS TAB ==========

interface AnalyticsData {
  dashboard: {
    stats: {
      streak: number;
      focusHours: number;
      tasksCompleted: number;
      badgesUnlocked: number;
      totalBadges: number;
    };
    patterns: {
      productiveTime: string;
      productiveDays: string;
    };
  } | null;
  progress: {
    summary: {
      totalCards: number;
      completedCards: number;
      completionRate: number;
      personalBest: string;
    };
    taskDistribution: {
      total: number;
      todoPercent: number;
      progPercent: number;
      revPercent: number;
      donePercent: number;
    };
  } | null;
  strategy_effectiveness: {
    strategies: {
      name: string;
      taskCount: number;
      subjective: { avgRating: number; totalRated: number; positivePercent: number };
      objective: { avgImprovement: number; totalTracked: number; isDataInsufficient: boolean };
    }[];
  } | null;
  confidence_trend: {
    courseName: string | null;
    availableCourses: { name: string; dataPoints: number }[];
    dataPoints: { date: string; confidence: number | null; learningGain: number | null }[];
    trend: string;
  } | null;
}

function AnalyticsTab({ userId }: { userId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = React.useCallback(() => {
    setLoading(true);
    setError(null);
    api.get<AnalyticsData>(`/admin/analytics/${userId}`)
      .then((res) => setData(res))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20" style={{ gap: "12px" }}>
        <p className="text-sm text-neutral-500">{error}</p>
        <button
          onClick={fetchData}
          className="text-sm font-medium px-4 py-2 rounded-lg"
          style={{ background: "#3B82F6", color: "#fff" }}
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!data) return null;

  const db = data.dashboard?.stats ?? null;
  const prog = data.progress?.summary ?? null;
  const progDist = data.progress?.taskDistribution ?? null;
  const strat = data.strategy_effectiveness;
  const conf = data.confidence_trend;

  return (
    <div style={col(20)}>
      {/* --- 1. Dashboard Stats --- */}
      <SectionLabel>Dashboard</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
        <Card>
          <div className="flex items-center gap-3 p-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(245,158,11,0.12)" }}
            >
              <Flame className="w-5 h-5" style={{ color: "#f59e0b" }} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-neutral-800">{db?.streak ?? 0}</p>
              <p className="text-sm text-neutral-400">Streak</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3 p-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(59,130,246,0.12)" }}
            >
              <Clock className="w-5 h-5" style={{ color: "#3B82F6" }} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-neutral-800">{db?.focusHours ?? 0}</p>
              <p className="text-sm text-neutral-400">Focus Hours</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3 p-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(16,185,129,0.12)" }}
            >
              <CheckCircle2 className="w-5 h-5" style={{ color: "#10b981" }} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-neutral-800">{db?.tasksCompleted ?? 0}</p>
              <p className="text-sm text-neutral-400">Tasks Done</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3 p-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(217,119,6,0.12)" }}
            >
              <Award className="w-5 h-5" style={{ color: "#d97706" }} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-neutral-800">{db?.badgesUnlocked ?? 0}<span className="text-sm font-normal text-neutral-400">/{db?.totalBadges ?? 0}</span></p>
              <p className="text-sm text-neutral-400">Badges</p>
            </div>
          </div>
        </Card>
      </div>

      {/* --- 2. Task Distribution --- */}
      {prog && progDist && (
        <>
          <SectionLabel>Distribusi Tugas</SectionLabel>
          <Card>
            <div className="p-4" style={col(14)}>
              {/* Completion rate */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">Completion Rate</span>
                <span className="text-sm font-semibold" style={{ color: "#10b981" }}>
                  {Math.round(prog.completionRate ?? 0)}%
                </span>
              </div>
              {prog.personalBest && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">Personal Best</span>
                  <span className="text-sm font-semibold" style={{ color: "#3B82F6" }}>{prog.personalBest}</span>
                </div>
              )}

              {/* Stacked bar */}
              <div
                className="rounded-lg overflow-hidden"
                style={{ height: "28px", display: "flex", background: "#f3f4f6" }}
              >
                {[
                  { pct: progDist.todoPercent ?? 0, color: "#94a3b8" },
                  { pct: progDist.progPercent ?? 0, color: "#3B82F6" },
                  { pct: progDist.revPercent ?? 0, color: "#f59e0b" },
                  { pct: progDist.donePercent ?? 0, color: "#10b981" },
                ].map((seg, i) => (
                  <div
                    key={i}
                    style={{
                      width: `${seg.pct}%`,
                      background: seg.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#fff",
                      minWidth: seg.pct > 5 ? "0" : "0px",
                    }}
                  >
                    {seg.pct > 8 ? `${seg.pct}%` : ""}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center" style={{ gap: "16px" }}>
                {[
                  { label: "To Do", pct: progDist.todoPercent ?? 0, color: "#94a3b8" },
                  { label: "In Progress", pct: progDist.progPercent ?? 0, color: "#3B82F6" },
                  { label: "Review", pct: progDist.revPercent ?? 0, color: "#f59e0b" },
                  { label: "Done", pct: progDist.donePercent ?? 0, color: "#10b981" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center" style={{ gap: "6px" }}>
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                    <span className="text-sm text-neutral-500">{item.label}</span>
                    <span className="text-sm font-medium text-neutral-700">{item.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </>
      )}

      {/* --- 3. Strategy Effectiveness --- */}
      <SectionLabel>Efektivitas Strategi</SectionLabel>
      {!strat?.strategies || strat.strategies.length === 0 ? (
        <Card>
          <div className="px-4 py-8 text-center text-sm text-neutral-400">Belum ada data strategi</div>
        </Card>
      ) : (
        <div style={col(12)}>
          {strat.strategies.map((s) => {
            const hasData = s.taskCount > 0;
            return (
              <Card key={s.name}>
                <div className="p-4" style={col(14)}>
                  {/* Strategy header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">{s.name}</p>
                      <p className="text-sm text-neutral-400">{s.taskCount} tugas</p>
                    </div>
                  </div>

                  {!hasData ? (
                    <div className="text-center py-4">
                      <BarChart3 className="w-5 h-5 text-neutral-300 mx-auto mb-2" />
                      <p className="text-sm text-neutral-400">Belum ada data</p>
                    </div>
                  ) : (
                    <div style={col(10)}>
                      {/* Subjective: Rating */}
                      {s.subjective && s.subjective.totalRated > 0 && (
                        <div className="rounded-xl p-3" style={{ background: "#fafafa", border: "1px solid #f3f4f6" }}>
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-xs text-neutral-500 font-medium">
                              Rating <span className="text-neutral-400">({s.subjective.totalRated} tugas)</span>
                            </p>
                            <span className="text-sm font-bold text-neutral-800">
                              {s.subjective.avgRating?.toFixed(1) ?? "—"}<span className="text-xs text-neutral-400 font-medium">/5</span>
                            </span>
                          </div>
                          <div className="w-full rounded-full overflow-hidden" style={{ height: "6px", background: "#e5e7eb" }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${s.subjective.positivePercent ?? 0}%`,
                                background: "#8b5cf6",
                                transition: "width 0.5s",
                              }}
                            />
                          </div>
                          <p className="text-xs text-neutral-400 text-right mt-1 font-medium">
                            {Math.round(s.subjective.positivePercent ?? 0)}% rating positif
                          </p>
                        </div>
                      )}

                      {/* Objective: Peningkatan Nilai */}
                      {s.objective && (
                        <div
                          className="rounded-xl p-3"
                          style={{
                            background: s.objective.isDataInsufficient ? "rgba(245,158,11,0.06)" : "rgba(59,130,246,0.06)",
                            border: `1px solid ${s.objective.isDataInsufficient ? "rgba(245,158,11,0.15)" : "rgba(59,130,246,0.15)"}`,
                          }}
                        >
                          <p className="text-xs text-neutral-500 font-medium mb-2">
                            Peningkatan Nilai <span className="text-neutral-400">({s.objective.totalTracked} tugas)</span>
                          </p>
                          {s.objective.isDataInsufficient ? (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                                style={{ background: "rgba(245,158,11,0.15)" }}
                              >
                                <BarChart3 className="w-3.5 h-3.5" style={{ color: "#d97706" }} />
                              </div>
                              <div>
                                <p className="text-xs font-semibold" style={{ color: "#92400e" }}>Data Kurang</p>
                                <p className="text-xs text-neutral-400">Tracking nilai perlu min. 3 tugas</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                style={{ background: "rgba(16,185,129,0.12)" }}
                              >
                                <TrendingUp className="w-4 h-4" style={{ color: "#059669" }} />
                              </div>
                              <div>
                                <p className="text-lg font-bold text-neutral-900">
                                  +{Math.round(s.objective.avgImprovement ?? 0)}%
                                </p>
                                <p className="text-xs font-medium" style={{ color: "#059669" }}>
                                  Peningkatan {(s.objective.avgImprovement ?? 0) > 20 ? "signifikan" : "stabil"}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* --- 4. Confidence Trend (SVG Line Chart) --- */}
      <SectionLabel>Confidence Trend</SectionLabel>
      <Card>
        {!conf || !conf.dataPoints || conf.dataPoints.length < 2 ? (
          <div className="px-4 py-8 text-center text-sm text-neutral-400">
            {conf?.dataPoints?.length === 1
              ? "Data hanya 1 titik, perlu min. 2 untuk trend"
              : "Belum ada data confidence"}
          </div>
        ) : (
          <div className="p-4" style={col(12)}>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center" style={{ gap: "8px" }}>
                {conf.courseName && (
                  <span className="text-sm font-medium text-neutral-800">{conf.courseName}</span>
                )}
                {(() => {
                  const t = conf.trend;
                  const isUp = t === "improving";
                  const isDown = t === "declining";
                  const bgColor = isUp ? "rgba(16,185,129,0.12)" : isDown ? "rgba(239,68,68,0.12)" : "rgba(59,130,246,0.12)";
                  const textColor = isUp ? "#059669" : isDown ? "#dc2626" : "#3B82F6";
                  const label = isUp ? "Meningkat" : isDown ? "Menurun" : "Stabil";
                  return (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: bgColor, color: textColor }}>
                      {label}
                    </span>
                  );
                })()}
              </div>
              {conf.dataPoints.length > 0 && (
                <span className="text-sm text-neutral-500">
                  Latest: <span className="font-semibold text-neutral-800">
                    {conf.dataPoints[conf.dataPoints.length - 1].confidence?.toFixed(1)}
                  </span>
                </span>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center" style={{ gap: "16px" }}>
              <div className="flex items-center" style={{ gap: "6px" }}>
                <div style={{ width: "12px", height: "2px", background: "#3B82F6", borderRadius: "1px" }} />
                <span className="text-xs text-neutral-500">Confidence</span>
              </div>
              <div className="flex items-center" style={{ gap: "6px" }}>
                <div style={{ width: "12px", height: "0", borderTop: "2px dashed #10b981" }} />
                <span className="text-xs text-neutral-500">Learning Gain</span>
              </div>
            </div>

            {/* SVG Line Chart */}
            <div style={{ position: "relative", width: "100%", height: "128px" }}>
              <svg style={{ width: "100%", height: "100%", overflow: "visible" }} preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="conf-gradient-admin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((y) => (
                  <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#f3f4f6" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                ))}
                {/* Area fill under confidence line */}
                {(() => {
                  const pts = conf.dataPoints.map((dp, i) => {
                    const x = conf.dataPoints.length === 1 ? 50 : (i / (conf.dataPoints.length - 1)) * 100;
                    const val = Math.max(1, Math.min(5, dp.confidence ?? 1));
                    const y = 100 - ((val - 1) / 4) * 100;
                    return { x, y };
                  });
                  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
                  const area = `${line} L${pts[pts.length - 1].x},100 L${pts[0].x},100 Z`;
                  return <path d={area} fill="url(#conf-gradient-admin)" />;
                })()}
                {/* Confidence line (solid blue) */}
                {(() => {
                  const pts = conf.dataPoints.map((dp, i) => {
                    const x = conf.dataPoints.length === 1 ? 50 : (i / (conf.dataPoints.length - 1)) * 100;
                    const val = Math.max(1, Math.min(5, dp.confidence ?? 1));
                    const y = 100 - ((val - 1) / 4) * 100;
                    return { x, y };
                  });
                  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
                  return <path d={d} fill="none" stroke="#3B82F6" strokeWidth="2" vectorEffect="non-scaling-stroke" />;
                })()}
                {/* Learning Gain line (dashed green) */}
                {(() => {
                  const validPts = conf.dataPoints.filter((dp) => dp.learningGain != null);
                  if (validPts.length < 2) return null;
                  const pts = validPts.map((dp, i) => {
                    const x = validPts.length === 1 ? 50 : (i / (validPts.length - 1)) * 100;
                    // learningGain is already a percentage, normalize to 1-5 scale for chart
                    const val = Math.max(1, Math.min(5, (dp.learningGain ?? 0) / 25 + 1));
                    const y = 100 - ((val - 1) / 4) * 100;
                    return { x, y };
                  });
                  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
                  return <path d={d} fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="2,2" vectorEffect="non-scaling-stroke" />;
                })()}
                {/* Data point dots */}
                {conf.dataPoints.map((dp, i) => {
                  const x = conf.dataPoints.length === 1 ? 50 : (i / (conf.dataPoints.length - 1)) * 100;
                  const val = Math.max(1, Math.min(5, dp.confidence ?? 1));
                  const y = 100 - ((val - 1) / 4) * 100;
                  return (
                    <circle key={i} cx={x} cy={y} r="1.5" fill="#3B82F6" vectorEffect="non-scaling-stroke" />
                  );
                })}
              </svg>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between" style={{ marginTop: "4px" }}>
              {conf.dataPoints.map((dp, i) => (
                <span key={i} className="text-neutral-400" style={{ fontSize: "9px" }}>
                  {fmtDate(dp.date)}
                </span>
              ))}
            </div>

            {/* Info note */}
            <div className="flex items-start" style={{ gap: "6px", paddingTop: "8px", borderTop: "1px solid #f3f4f6" }}>
              <BarChart3 className="w-3 h-3 text-neutral-400 shrink-0 mt-0.5" />
              <p className="text-xs text-neutral-400 leading-relaxed">
                Data menunjukkan korelasi antara tingkat keyakinan diri dan peningkatan pembelajaran.
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// ========== STREAK TAB ==========

function StreakTab({ streak, currentStreak }: { streak: AdminUserDetail["streak"]; currentStreak: number }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  const MONTH_NAMES = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  // Build a Set of active dates for quick lookup
  const activeSet = useMemo(() => new Set(streak?.active_dates ?? []), [streak]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Build calendar cells: padding + days
  const cells: { day: number; dateStr: string; active: boolean; isToday: boolean }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, dateStr, active: activeSet.has(dateStr), isToday: dateStr === todayStr });
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  }

  // Count active days this month
  const activeThisMonth = cells.filter((c) => c.active).length;

  return (
    <div style={col(16)}>
      {/* Streak card */}
      <Card>
        <div className="p-5 flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "#fef3c7" }}
          >
            <Flame className="w-6 h-6" style={{ color: "#f59e0b" }} />
          </div>
          <div>
            <p className="text-3xl font-bold text-neutral-800">{currentStreak}</p>
            <p className="text-sm text-neutral-500">hari berturut-turut</p>
          </div>
        </div>
      </Card>

      {/* Calendar */}
      <Card>
        <div className="p-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-400"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-center">
              <p className="text-sm font-semibold text-neutral-800">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">{activeThisMonth} hari aktif</p>
            </div>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-400"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
            {DAY_LABELS.map((d) => (
              <div
                key={d}
                className="text-center font-medium py-1"
                style={{ fontSize: "11px", color: "#9ca3af" }}
              >
                {d}
              </div>
            ))}

            {/* Padding for first row */}
            {Array.from({ length: firstDayOfWeek }, (_, i) => (
              <div key={`pad-${i}`} />
            ))}

            {/* Day cells */}
            {cells.map((cell) => (
              <div
                key={cell.dateStr}
                className="rounded flex items-center justify-center"
                style={{
                  height: "32px",
                  background: cell.active ? "rgba(16,185,129,0.14)" : "#f9fafb",
                  color: cell.active ? "#047857" : "#d1d5db",
                  fontSize: "12px",
                  fontWeight: cell.active ? 600 : 400,
                  outline: cell.isToday ? "2px solid #3B82F6" : "none",
                  outlineOffset: "-1px",
                }}
                title={cell.dateStr}
              >
                {cell.day}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ========== PREFS TAB ==========

function PrefsTab({ preferences }: { preferences: AdminPreferences | null }) {
  if (!preferences) {
    return (
      <div className="text-center py-8 text-sm text-neutral-400">
        Belum ada preferensi tersimpan
      </div>
    );
  }

  const notifs = preferences.notifications;
  const char = preferences.character;

  const items: { icon: React.ElementType; label: string; value: string | boolean; type: "toggle" | "text" }[] = [
    { icon: Bell, label: "Push Notifications", value: notifs?.push_enabled ?? false, type: "toggle" },
    { icon: Bell, label: "Smart Reminder", value: notifs?.smart_reminder_enabled ?? false, type: "toggle" },
    { icon: Users, label: "Social Presence", value: notifs?.social_presence_enabled ?? false, type: "toggle" },
    {
      icon: Moon,
      label: "Quiet Hours",
      value: notifs?.quiet_hours?.start && notifs?.quiet_hours?.end
        ? `${notifs.quiet_hours.start} — ${notifs.quiet_hours.end}`
        : "Tidak diatur",
      type: "text",
    },
    {
      icon: preferences.theme === "dark" ? Moon : Sun,
      label: "Theme",
      value: preferences.theme === "dark" ? "Dark" : preferences.theme === "auto" ? "Auto" : "Light",
      type: "text",
    },
    ...(char
      ? [{ icon: User, label: "Character", value: char.gender === "female" ? "Perempuan" : "Laki-laki", type: "text" as const }]
      : []),
  ];

  return (
    <div style={col(16)}>
      <Card>
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <ListRow key={item.label} last={i === items.length - 1}>
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-neutral-400" />
                <span className="text-sm text-neutral-700">{item.label}</span>
              </div>
              {item.type === "toggle" ? (
                <div
                  style={{
                    position: "relative",
                    width: "40px",
                    height: "22px",
                    borderRadius: "11px",
                    background: item.value ? "#3B82F6" : "#d1d5db",
                    transition: "background 0.2s",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "3px",
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      background: "#fff",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                      left: item.value ? "21px" : "3px",
                      transition: "left 0.2s",
                    }}
                  />
                </div>
              ) : (
                <span className="text-sm text-neutral-500">{item.value}</span>
              )}
            </ListRow>
          );
        })}
      </Card>

      {char && (
        <Card>
          <div className="p-4">
            <p className="text-sm font-semibold text-neutral-700 mb-3">Equipped Items</p>
            <div style={{ display: "flex", gap: "10px" }}>
              {Object.entries(char.equipped).map(([slot, item]) => (
                <div key={slot} className="rounded-lg px-4 py-3" style={{ background: "#f9fafb" }}>
                  <p className="text-sm text-neutral-400 capitalize">{slot}</p>
                  <p className="text-sm text-neutral-700 font-medium mt-0.5">{item || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// ========== MAIN PAGE ==========

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const { id } = React.use(params);
  const { userDetail, userDetailLoading, fetchUserDetail, clearUserDetail } = useAdminStore();

  useEffect(() => {
    fetchUserDetail(id);
    return () => clearUserDetail();
  }, [id, fetchUserDetail, clearUserDetail]);

  if (userDetailLoading && !userDetail) {
    return (
      <div className="mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!userDetail) {
    return (
      <div className="mx-auto text-center py-20">
        <p className="text-neutral-400">User tidak ditemukan</p>
        <Link href="/admin/users" className="text-sm text-primary hover:underline mt-2 inline-block">
          Kembali ke daftar users
        </Link>
      </div>
    );
  }

  const { user, preferences, badges, goals, task_goals, board, recent_study_sessions, total_session_sec, total_session_sec_valid, total_sessions_orphan, streak } = userDetail;

  return (
    <div className="mx-auto" style={col(20)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/users"
          className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center font-semibold shrink-0"
            style={{ background: "rgba(59,130,246,0.1)", color: "#3B82F6", fontSize: "16px" }}
          >
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-neutral-800 truncate">{user.name}</h1>
            <p className="text-sm text-neutral-400 truncate">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-neutral-400 shrink-0">
          <Calendar className="w-4 h-4" />
          {fmtDate(user.created_at)}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto no-scrollbar" style={{ gap: "6px" }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all shrink-0"
              style={{
                background: isActive ? "#3B82F6" : "transparent",
                color: isActive ? "#fff" : "#6b7280",
                boxShadow: isActive ? "0 2px 8px rgba(59,130,246,0.2)" : "none",
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#f3f4f6"; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "profile" && (
        <ProfileTab user={user} preferences={preferences} streak={streak} />
      )}
      {activeTab === "board" && <BoardTab board={board} />}
      {activeTab === "goals" && <GoalsTab goals={goals} taskGoals={task_goals} />}
      {activeTab === "badges" && <BadgesTab badges={badges} />}
      {activeTab === "sessions" && <SessionsTab sessions={recent_study_sessions} totalSessionSec={total_session_sec ?? 0} totalSessionSecValid={total_session_sec_valid ?? 0} totalSessionsOrphan={total_sessions_orphan ?? 0} />}
      {activeTab === "analytics" && <AnalyticsTab userId={user._id} />}
      {activeTab === "streak" && (
        <StreakTab streak={streak} currentStreak={streak?.current ?? 0} />
      )}
      {activeTab === "prefs" && <PrefsTab preferences={preferences} />}
    </div>
  );
}

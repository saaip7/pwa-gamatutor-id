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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminStore } from "@/stores/admin";
import type {
  AdminUser,
  AdminBadge,
  AdminGoal,
  AdminBoard,
  AdminStudySession,
  AdminPreferences,
  AdminUserDetail,
} from "@/stores/admin";

// --- Types ---
type TabKey = "profile" | "board" | "goals" | "badges" | "sessions" | "streak" | "prefs";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "profile", label: "Profil", icon: User },
  { key: "board", label: "Board", icon: LayoutGrid },
  { key: "goals", label: "Goals", icon: Target },
  { key: "badges", label: "Badges", icon: Award },
  { key: "sessions", label: "Sessions", icon: Clock },
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
const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" };

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

function BoardTab({ board }: { board: AdminBoard | null }) {
  // Group cards by column from board lists
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
        if (groups[colKey]) {
          groups[colKey].cards = list.cards || [];
        }
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
          <div key={colKey} style={col(8)}>
            {/* Column header */}
            <div
              className="rounded-lg px-4 py-2.5 flex items-center justify-between"
              style={{ background: meta.light }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: meta.color }} />
                <span className="text-sm font-semibold" style={{ color: meta.color }}>{meta.label}</span>
              </div>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: meta.bg, color: meta.color }}
              >
                {colCards.length}
              </span>
            </div>

            {/* Cards */}
            {colCards.length === 0 ? (
              <p className="text-sm text-neutral-400 py-3 text-center">Kosong</p>
            ) : (
              <div style={col(8)}>
                {colCards.map((card) => (
                  <Card key={card.id}>
                    <div className="p-4" style={col(10)}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-neutral-800">{card.task_name}</p>
                          {card.course_name && (
                            <p className="text-sm text-neutral-400 mt-0.5">{card.course_name}</p>
                          )}
                        </div>
                        {card.difficulty && (
                          <span
                            className="text-sm font-medium px-2 py-0.5 rounded shrink-0"
                            style={{ background: "#f3f4f6", color: "#6b7280" }}
                          >
                            Lv {card.difficulty}
                          </span>
                        )}
                      </div>
                      {card.description && (
                        <p className="text-sm text-neutral-500 leading-relaxed">{card.description}</p>
                      )}
                      {card.reflection?.notes && (
                        <div className="rounded-md px-3 py-2" style={{ background: meta.bg }}>
                          <p className="text-sm" style={{ color: meta.color }}>
                            {card.reflection.notes}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-neutral-400">
                        {card.personal_best && (
                          <span className="font-medium" style={{ color: "#059669" }}>PB {card.personal_best}</span>
                        )}
                        {card.deadline && <span>Deadline: {fmtDate(card.deadline)}</span>}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ========== GOALS TAB ==========

function GoalsTab({ goals }: { goals: AdminGoal[] }) {
  const grouped = useMemo(() => ({
    general: goals.filter((g) => !g.card_id),
    task: goals.filter((g) => g.card_id),
  }), [goals]);

  const META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    general: { label: "General Goals", icon: Target, color: "#3B82F6" },
    task: { label: "Task Goals", icon: CheckCircle2, color: "#059669" },
  };

  return (
    <div style={col(20)}>
      {(Object.entries(grouped) as [string, AdminGoal[]][]).map(([type, items]) => {
        const m = META[type];
        const Icon = m.icon;
        return (
          <div key={type} style={col(8)}>
            <div className="flex items-center gap-2.5">
              <div
                className="w-6 h-6 rounded flex items-center justify-center"
                style={{ background: `${m.color}1a` }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: m.color }} />
              </div>
              <SectionLabel>{m.label}</SectionLabel>
              <span className="text-sm text-neutral-400">{items.length}</span>
            </div>
            {items.length === 0 ? (
              <p className="text-sm text-neutral-400 py-3 text-center">Belum ada</p>
            ) : (
              <Card>
                {items.map((goal, i) => {
                  const content = goal.goal_text || [goal.text_pre, goal.text_highlight].filter(Boolean).join(" ");
                  return (
                    <ListRow key={goal._id} last={i === items.length - 1}>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-neutral-800">{content}</p>
                        {goal.card_id && (
                          <p className="text-sm text-neutral-400 mt-0.5">Task: {goal.card_id}</p>
                        )}
                      </div>
                      <span className="text-sm text-neutral-400 shrink-0 ml-3">{fmtDate(goal.created_at)}</span>
                    </ListRow>
                  );
                })}
              </Card>
            )}
          </div>
        );
      })}
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
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

function SessionsTab({ sessions }: { sessions: AdminStudySession[] }) {
  const totalMin = sessions.reduce((acc, s) => acc + (s.duration ? Math.round(s.duration / 60) : 0), 0);
  return (
    <div style={col(16)}>
      <div style={grid2}>
        <Card>
          <div className="p-4">
            <p className="text-sm text-neutral-500">Total Sessions</p>
            <p className="text-2xl font-bold text-neutral-800 mt-1">{sessions.length}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-neutral-500">Total Waktu</p>
            <p className="text-2xl font-bold text-neutral-800 mt-1">{fmtDuration(totalMin)}</p>
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
              <p className="text-sm font-medium text-neutral-800">
                {s.status === "active" ? "Sesi Aktif" : "Sesi Selesai"}
              </p>
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

  const { user, preferences, badges, goals, board, recent_study_sessions, streak } = userDetail;

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
      {activeTab === "goals" && <GoalsTab goals={goals} />}
      {activeTab === "badges" && <BadgesTab badges={badges} />}
      {activeTab === "sessions" && <SessionsTab sessions={recent_study_sessions} />}
      {activeTab === "streak" && (
        <StreakTab streak={streak} currentStreak={streak?.current ?? 0} />
      )}
      {activeTab === "prefs" && <PrefsTab preferences={preferences} />}
    </div>
  );
}

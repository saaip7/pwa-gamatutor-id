"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DashboardHeader } from "@/components/feature/dashboard/DashboardHeader";
import { CharacterShowcase } from "@/components/feature/dashboard/CharacterShowcase";
import { StudyPatterns } from "@/components/feature/dashboard/StudyPatterns";
import { TodayTasksList } from "@/components/feature/dashboard/TodayTasksList";
import { AchievementBanner } from "@/components/feature/mastery/AchievementBanner";
import { Task } from "@/components/ui/TaskCard";
import { StreakHub } from "@/components/feature/streak/StreakHub";
import type { StreakData as ComponentStreakData } from "@/components/feature/streak/StreakHub";
import { StreakFreezeCelebration } from "@/components/feature/streak/StreakFreezeCelebration";
import { AnnouncementModal } from "@/components/feature/dashboard/AnnouncementModal";
import { useAuthStore } from "@/stores/auth";
import { useAnalyticsStore } from "@/stores/analytics";
import { useBoardStore } from "@/stores/board";
import { useNotificationsStore } from "@/stores/notifications";
import type { BoardCard } from "@/types";

// --- Helpers ---

function formatRelativeDeadline(deadline?: string): string {
  if (!deadline) return "Tidak Pasti";
  const d = new Date(deadline);
  const now = new Date();

  // Compare by calendar date in local timezone, not raw ms diff
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const deadlineDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((deadlineDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Terlambat";
  if (diffDays === 0) {
    return d.toLocaleTimeString("id-ID", { hour: "numeric", minute: "2-digit" });
  }
  if (diffDays === 1) return "Besok";
  if (diffDays <= 7) return d.toLocaleDateString("id-ID", { weekday: "short" });
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function boardCardToTask(card: BoardCard): Task {
  const checklists = card.checklists || [];
  const completed = checklists.filter((s: { isCompleted: boolean }) => s.isCompleted).length;
  const total = checklists.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    id: card.id,
    title: card.task_name,
    course: card.course_name,
    description: card.description,
    progressText: total > 0 ? `${completed}/${total}` : "0/0",
    progressPercent: percent,
    priority: (card.priority || "Medium") as "High" | "Medium" | "Low",
    difficulty: card.difficulty || "Medium",
    time: formatRelativeDeadline(card.deadline),
    subtasks: checklists.map((c: { id: string; title: string; isCompleted: boolean }) => ({
      id: c.id,
      title: c.title,
      isCompleted: c.isCompleted,
    })),
  };
}

// Default data used while stores are loading
const DEFAULT_STATS = {
  streak: 0,
  focus_hours: 0,
  tasks_completed: 0,
  badges_unlocked: 0,
  total_badges: 0,
};

const DEFAULT_PATTERNS = {
  productive_time: "-",
  productive_days: "-",
};

const DEFAULT_STREAK_DATA: ComponentStreakData = {
  current: 0,
  longest: 0,
  days: [
    { label: "Sen", state: "future" as const },
    { label: "Sel", state: "future" as const },
    { label: "Rab", state: "future" as const },
    { label: "Kam", state: "future" as const },
    { label: "Jum", state: "today" as const },
    { label: "Sab", state: "future" as const },
    { label: "Min", state: "future" as const },
  ],
  freezes_available: 0,
};

const STREAK_SHOWN_KEY = "streak_hub_shown";

export default function DashboardPage() {
  const [isStreakHubOpen, setIsStreakHubOpen] = useState(false);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);

  // Store selectors
  const { user } = useAuthStore();
  const { dashboard, streak, fetchDashboard, fetchStreak } = useAnalyticsStore();
  const { tasks: boardTasks, columns, fetchBoard } = useBoardStore();
  const { unreadCount, fetchUnreadCount } = useNotificationsStore();

  // Fetch page-specific data on mount (profile/badges/preferences handled by AuthGuard)
  useEffect(() => {
    fetchDashboard();
    fetchStreak();
    fetchBoard();
    fetchUnreadCount();
  }, [fetchDashboard, fetchStreak, fetchBoard, fetchUnreadCount]);

  // Determine if we're still loading core data
  const isInitialLoading = !dashboard && !user;

  // Derived data
  const userName = user?.name || "Student";
  const hasUnreadNotifications = unreadCount > 0;

  const stats = dashboard?.stats ?? DEFAULT_STATS;
  const patterns = dashboard?.patterns ?? DEFAULT_PATTERNS;
  const streakData: ComponentStreakData = (streak as ComponentStreakData) ?? DEFAULT_STREAK_DATA;

  // Today's tasks: cards from planning + monitoring columns
  const todayTasks: Task[] = useMemo(() => {
    const todayIds = [...(columns.planning || []), ...(columns.monitoring || [])];
    return todayIds
      .map((id) => boardTasks[id])
      .filter(Boolean)
      .map(boardCardToTask);
  }, [boardTasks, columns]);

  // Auto-show streak hub on mount if streak >= 2 and not already shown this session
  useEffect(() => {
    const alreadyShown = sessionStorage.getItem(STREAK_SHOWN_KEY);
    if (!alreadyShown && streakData.current >= 2) {
      const timer = setTimeout(() => {
        setIsStreakHubOpen(true);
        sessionStorage.setItem(STREAK_SHOWN_KEY, "1");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [streakData.current]);

  const handleUseFreeze = () => {
    setIsStreakHubOpen(false);
    setTimeout(() => setIsCelebrationOpen(true), 300);
  };

  // Loading skeleton
  if (isInitialLoading) {
    return (
      <>
        <DashboardHeader userName="..." hasUnreadNotifications={false} />
      <div className="lg:px-0 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 lg:row-span-2">
              <div className="bg-white rounded-[24px] border border-neutral-100 p-8 animate-pulse h-full">
                <div className="flex justify-between mb-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-neutral-200" />
                      <div className="w-10 h-4 rounded bg-neutral-200" />
                    </div>
                  ))}
                </div>
                <div className="flex justify-center py-6">
                  <div className="w-40 h-48 rounded-2xl bg-neutral-100" />
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[24px] p-5 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-neutral-200" />
                  <div className="flex-1 space-y-2">
                    <div className="w-40 h-4 rounded bg-neutral-200" />
                    <div className="w-full h-1.5 rounded-full bg-neutral-100" />
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[24px] p-5 animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-200" />
                  <div className="w-32 h-4 rounded bg-neutral-200" />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 h-16 rounded-xl bg-neutral-100" />
                  <div className="flex-1 h-16 rounded-xl bg-neutral-100" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardHeader
        userName={userName}
        hasUnreadNotifications={hasUnreadNotifications}
        streak={stats.streak}
        tasks_completed={stats.tasks_completed}
      />

      <div className="px-6 lg:px-0 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-1 lg:row-span-2 lg:h-full">
            <CharacterShowcase
              stats={stats}
              onStreakTap={() => setIsStreakHubOpen(true)}
              className="lg:h-full"
            />
          </div>

          <div className="lg:col-span-2">
            <AchievementBanner
              unlockedCount={stats.badges_unlocked}
              totalCount={stats.total_badges}
              variant="dashboard"
            />
          </div>

          <div className="lg:col-span-2">
            <StudyPatterns patterns={patterns} />
          </div>

          <div className="lg:col-span-3">
            <TodayTasksList tasks={todayTasks} />
          </div>

        </div>
      </div>

      <StreakHub
        isOpen={isStreakHubOpen}
        onClose={() => setIsStreakHubOpen(false)}
        data={streakData}
        onUseFreeze={handleUseFreeze}
      />

      <StreakFreezeCelebration
        isOpen={isCelebrationOpen}
        onClose={() => setIsCelebrationOpen(false)}
      />

      <AnnouncementModal />
    </>
  );
}

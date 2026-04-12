"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DashboardHeader } from "@/components/feature/dashboard/DashboardHeader";
import { CharacterShowcase } from "@/components/feature/dashboard/CharacterShowcase";
import { StudyPatterns } from "@/components/feature/dashboard/StudyPatterns";
import { TodayTasksList } from "@/components/feature/dashboard/TodayTasksList";
import { Task } from "@/components/ui/TaskCard";
import { StreakHub } from "@/components/feature/streak/StreakHub";
import type { StreakData as ComponentStreakData } from "@/components/feature/streak/StreakHub";
import { StreakFreezeCelebration } from "@/components/feature/streak/StreakFreezeCelebration";
import { useAuthStore } from "@/stores/auth";
import { useAnalyticsStore } from "@/stores/analytics";
import { useBoardStore } from "@/stores/board";
import { useNotificationsStore } from "@/stores/notifications";
import type { BoardCard } from "@/types";

// --- Helpers ---

function formatRelativeDeadline(deadline?: string): string {
  if (!deadline) return "No deadline";
  const d = new Date(deadline);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) {
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return d.toLocaleDateString("en-US", { weekday: "short" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
    priority: "Medium" as const,
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
  focusHours: 0,
  tasksCompleted: 0,
  badgesUnlocked: 0,
  totalBadges: 0,
};

const DEFAULT_PATTERNS = {
  productiveTime: "-",
  productiveDays: "-",
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
  freezesAvailable: 0,
};

const STREAK_SHOWN_KEY = "streak_hub_shown";

export default function DashboardPage() {
  const [isStreakHubOpen, setIsStreakHubOpen] = useState(false);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);

  // Store selectors
  const { user, fetchProfile } = useAuthStore();
  const { dashboard, streak, fetchDashboard, fetchStreak } = useAnalyticsStore();
  const { tasks: boardTasks, columns, fetchBoard } = useBoardStore();
  const { unreadCount, fetchUnreadCount } = useNotificationsStore();

  // Fetch data on mount
  useEffect(() => {
    fetchProfile();
    fetchDashboard();
    fetchStreak();
    fetchBoard();
    fetchUnreadCount();
  }, [fetchProfile, fetchDashboard, fetchStreak, fetchBoard, fetchUnreadCount]);

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
        <div className="px-6 mb-8">
          <div className="bg-white rounded-[24px] border border-neutral-100 p-8 animate-pulse">
            <div className="flex justify-between mb-6">
              {[1, 2, 3, 4].map((i) => (
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
        <div className="px-6 mb-8">
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
      </>
    );
  }

  return (
    <>
      <DashboardHeader
        userName={userName}
        hasUnreadNotifications={hasUnreadNotifications}
      />

      <CharacterShowcase
        stats={stats}
        onStreakTap={() => setIsStreakHubOpen(true)}
      />

      <StudyPatterns patterns={patterns} />

      <TodayTasksList tasks={todayTasks} />

      {/* Streak Hub Modal */}
      <StreakHub
        isOpen={isStreakHubOpen}
        onClose={() => setIsStreakHubOpen(false)}
        data={streakData}
        onUseFreeze={handleUseFreeze}
      />

      {/* Streak Freeze Celebration Overlay */}
      <StreakFreezeCelebration
        isOpen={isCelebrationOpen}
        onClose={() => setIsCelebrationOpen(false)}
      />
    </>
  );
}

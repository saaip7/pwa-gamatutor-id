"use client";

import React, { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/feature/dashboard/DashboardHeader";
import { CharacterShowcase } from "@/components/feature/dashboard/CharacterShowcase";
import { StudyPatterns } from "@/components/feature/dashboard/StudyPatterns";
import { TodayTasksList } from "@/components/feature/dashboard/TodayTasksList";
import { Task } from "@/components/ui/TaskCard";
import { StreakHub, StreakData } from "@/components/feature/streak/StreakHub";
import { StreakFreezeCelebration } from "@/components/feature/streak/StreakFreezeCelebration";

// TODO: Fetch from API
const MOCK_USER_DATA = {
  name: "Alex Walker",
  hasUnreadNotifications: true,
  stats: {
    streak: 12,
    focusHours: 42,
    tasksCompleted: 156,
    badgesUnlocked: 8,
    totalBadges: 10,
  },
  patterns: {
    productiveTime: "Malam hari (20:00 - 22:00)",
    productiveDays: "Rabu & Kamis",
  },
  todayTasks: [
    {
      id: "task-1",
      title: "Calculus Chapter 4 Review",
      course: "MATH201 - Calculus II",
      description: "Review all formulas and practice problems for the upcoming midterm.",
      progressText: "3/5",
      progressPercent: 60,
      priority: "High",
      difficulty: "Medium",
      time: "2:00 PM",
      tag: "Monitoring",
      subtasks: [
        { id: "st-1", title: "Read sections 4.1 - 4.3", isCompleted: true },
        { id: "st-2", title: "Complete practice problems", isCompleted: true },
        { id: "st-3", title: "Watch supplementary video", isCompleted: false },
        { id: "st-4", title: "Make notes", isCompleted: false },
        { id: "st-5", title: "Review formulas", isCompleted: false },
      ],
    } as Task,
    {
      id: "task-2",
      title: "Write Physics Lab Report",
      course: "PHY102 - Quantum Mechanics",
      description: "Draft the introduction and format the data tables from yesterday's lab.",
      progressText: "1/3",
      progressPercent: 33,
      priority: "Medium",
      difficulty: "Hard",
      time: "4:30 PM",
      tag: "Planning",
      subtasks: [
        { id: "st-6", title: "Draft Introduction", isCompleted: true },
        { id: "st-7", title: "Format Data Tables", isCompleted: false },
        { id: "st-8", title: "Write Conclusion", isCompleted: false },
      ],
    } as Task,
  ],
};

// TODO: Fetch from API — this would come from analytics endpoint
const MOCK_STREAK_DATA: StreakData = {
  current: 7,
  longest: 12,
  days: [
    { label: "Sen", state: "completed" },
    { label: "Sel", state: "completed" },
    { label: "Rab", state: "freeze" },
    { label: "Kam", state: "completed" },
    { label: "Jum", state: "today" },
    { label: "Sab", state: "future" },
    { label: "Min", state: "future" },
  ],
  freezesAvailable: 1,
};

const STREAK_SHOWN_KEY = "streak_hub_shown";

export default function DashboardPage() {
  const [isStreakHubOpen, setIsStreakHubOpen] = useState(false);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);

  // Auto-show streak hub on mount if streak >= 2 and not already shown this session
  useEffect(() => {
    const alreadyShown = sessionStorage.getItem(STREAK_SHOWN_KEY);
    if (!alreadyShown && MOCK_STREAK_DATA.current >= 2) {
      const timer = setTimeout(() => {
        setIsStreakHubOpen(true);
        sessionStorage.setItem(STREAK_SHOWN_KEY, "1");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleUseFreeze = () => {
    // Close streak hub, then show celebration
    setIsStreakHubOpen(false);
    setTimeout(() => setIsCelebrationOpen(true), 300);
  };

  return (
    <>
      <DashboardHeader
        userName={MOCK_USER_DATA.name}
        hasUnreadNotifications={MOCK_USER_DATA.hasUnreadNotifications}
      />

      <CharacterShowcase
        stats={MOCK_USER_DATA.stats}
        onStreakTap={() => setIsStreakHubOpen(true)}
      />

      <StudyPatterns patterns={MOCK_USER_DATA.patterns} />

      <TodayTasksList tasks={MOCK_USER_DATA.todayTasks} />

      {/* Streak Hub Modal */}
      <StreakHub
        isOpen={isStreakHubOpen}
        onClose={() => setIsStreakHubOpen(false)}
        data={MOCK_STREAK_DATA}
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

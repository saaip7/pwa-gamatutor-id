import React from "react";
import { DashboardHeader } from "@/components/feature/dashboard/DashboardHeader";
import { CharacterShowcase } from "@/components/feature/dashboard/CharacterShowcase";
import { StudyPatterns } from "@/components/feature/dashboard/StudyPatterns";
import { TodayTasksList } from "@/components/feature/dashboard/TodayTasksList";
import { Task } from "@/components/ui/TaskCard";

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
      progressText: "3/5",
      progressPercent: 60,
      priority: "High",
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
      progressText: "1/3",
      progressPercent: 33,
      priority: "Medium",
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

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader 
        userName={MOCK_USER_DATA.name} 
        hasUnreadNotifications={MOCK_USER_DATA.hasUnreadNotifications} 
      />
      
      <CharacterShowcase stats={MOCK_USER_DATA.stats} />
      
      <StudyPatterns patterns={MOCK_USER_DATA.patterns} />
      
      <TodayTasksList tasks={MOCK_USER_DATA.todayTasks} />
    </>
  );
}

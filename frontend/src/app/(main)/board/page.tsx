"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { BoardHeader } from "@/components/feature/board/BoardHeader";
import { FilterBar } from "@/components/feature/board/FilterBar";
import { BoardColumn } from "@/components/feature/board/BoardColumn";
import { BoardTaskCard } from "@/components/ui/BoardTaskCard";
import { Task } from "@/components/ui/TaskCard";

// TODO: Fetch from API
const MOCK_BOARD_DATA = {
  userName: "Student",
  activeTasksCount: 12,
  hasUnreadNotifications: true,
  filters: ["All", "CS101", "MATH201", "ENG105", "PHY102"],
  columns: {
    planning: [
      {
        id: "task-1",
        title: "Implement BST Methods",
        course: "CS101 - Data Structures",
        description: "Implement insert, delete, and search logic.",
        progressText: "2/5",
        progressPercent: 40,
        priority: "High",
        difficulty: "Hard",
        time: "Today",
        subtasks: [
          { id: "st-1", title: "Setup project structure", isCompleted: true },
          { id: "st-2", title: "Write Node class", isCompleted: true },
          { id: "st-3", title: "Implement insert method", isCompleted: false },
        ],
      } as Task,
      {
        id: "task-2",
        title: "Review Lecture Slides",
        course: "CS101 - Data Structures",
        progressText: "0/0",
        progressPercent: 0,
        priority: "Low",
        difficulty: "Easy",
        time: "Fri",
        subtasks: [],
      } as Task,
    ],
    monitoring: [
      {
        id: "task-3",
        title: "Draft Research Paper",
        course: "ENG105 - Academic Writing",
        progressText: "3/4",
        progressPercent: 75,
        priority: "Medium",
        difficulty: "Medium",
        time: "Tomorrow",
        subtasks: [
          { id: "st-4", title: "Outline structure", isCompleted: true },
          { id: "st-5", title: "Write intro", isCompleted: true },
          { id: "st-6", title: "Draft methodology", isCompleted: true },
          { id: "st-7", title: "Write conclusion", isCompleted: false },
        ],
      } as Task,
      {
        id: "task-4",
        title: "Read Chapter 5: Quantum Mechanics",
        course: "PHY102 - Quantum Mechanics",
        description: "Focus on the Heisenberg uncertainty principle and its derivation. Make sure to take notes on the corresponding examples given at the end of the chapter.",
        progressText: "0/0",
        progressPercent: 0,
        priority: "Low",
        difficulty: "Hard",
        time: "Oct 26",
        subtasks: [],
      } as Task,
    ],
    controlling: [
      {
        id: "task-5",
        title: "Prepare Presentation",
        course: "MATH201 - Calculus II",
        progressText: "1/4",
        progressPercent: 25,
        priority: "High",
        difficulty: "Medium",
        time: "6:00 PM",
        subtasks: [
          { id: "st-8", title: "Draft slides", isCompleted: true },
          { id: "st-9", title: "Add visuals", isCompleted: false },
          { id: "st-10", title: "Rehearse timing", isCompleted: false },
          { id: "st-11", title: "Review feedback", isCompleted: false },
        ],
      } as Task,
    ],
    reflection: [
      {
        id: "task-6",
        title: "Midterm Exam",
        course: "CS101 - Data Structures",
        progressText: "1/1",
        progressPercent: 100,
        priority: "High",
        difficulty: "Easy",
        time: "Completed",
        subtasks: [],
      } as Task,
    ],
  },
};

export default function KanbanBoardPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <>
      <BoardHeader 
        userName={MOCK_BOARD_DATA.userName}
        activeTasksCount={MOCK_BOARD_DATA.activeTasksCount}
        hasUnreadNotifications={MOCK_BOARD_DATA.hasUnreadNotifications}
      />

      <FilterBar 
        filters={MOCK_BOARD_DATA.filters}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Kanban Board Area (Horizontally Scrollable) */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden snap-x snap-mandatory flex no-scrollbar relative w-full h-[calc(100vh-200px)]">
        
        {/* PLANNING Column */}
        <BoardColumn 
          title="Planning" 
          count={MOCK_BOARD_DATA.columns.planning.length}
          dotColorClass="bg-planning shadow-[0_0_8px_var(--color-planning)]"
          badgeColorClass="text-primary bg-blue-100"
        >
          {MOCK_BOARD_DATA.columns.planning.map(task => (
             <BoardTaskCard 
               key={task.id} 
               task={task} 
               statusColorClass="border-l-planning" 
               progressBgClass="bg-planning/20" 
             />
          ))}
        </BoardColumn>

        {/* MONITORING Column */}
        <BoardColumn 
          title="Monitoring" 
          count={MOCK_BOARD_DATA.columns.monitoring.length}
          dotColorClass="bg-monitoring shadow-[0_0_8px_var(--color-monitoring)]"
          badgeColorClass="text-white bg-monitoring"
        >
          {MOCK_BOARD_DATA.columns.monitoring.map(task => (
             <BoardTaskCard 
               key={task.id} 
               task={task} 
               statusColorClass="border-l-monitoring" 
               progressBgClass="bg-monitoring/10" 
             />
          ))}
        </BoardColumn>

        {/* CONTROLLING Column */}
        <BoardColumn 
          title="Controlling" 
          count={MOCK_BOARD_DATA.columns.controlling.length}
          dotColorClass="bg-controlling shadow-[0_0_8px_var(--color-controlling)]"
          badgeColorClass="text-white bg-controlling"
        >
           {MOCK_BOARD_DATA.columns.controlling.map(task => (
             <BoardTaskCard 
               key={task.id} 
               task={task} 
               statusColorClass="border-l-controlling" 
               progressBgClass="bg-controlling/10" 
             />
          ))}
        </BoardColumn>

        {/* REFLECTION Column */}
        <BoardColumn 
          title="Reflection" 
          count={MOCK_BOARD_DATA.columns.reflection.length}
          dotColorClass="bg-reflection shadow-[0_0_8px_var(--color-reflection)]"
          badgeColorClass="text-white bg-reflection"
        >
          {MOCK_BOARD_DATA.columns.reflection.map(task => (
             <BoardTaskCard 
               key={task.id} 
               task={task} 
               statusColorClass="border-l-reflection" 
               progressBgClass="bg-reflection/10" 
               isCompleted={true}
             />
          ))}
        </BoardColumn>

      </div>

      {/* Floating Action Button */}
      <button 
        className="fixed right-5 bottom-24 w-14 h-14 bg-primary text-white rounded-full shadow-[0_4px_16px_rgba(59,130,246,0.5)] flex items-center justify-center hover:bg-primary-hover active:scale-95 transition-all z-30"
        aria-label="Add new task"
      >
        <Plus className="w-6 h-6" />
      </button>
    </>
  );
}

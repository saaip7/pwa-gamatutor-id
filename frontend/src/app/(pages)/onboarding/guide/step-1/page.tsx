"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Joyride, STATUS } from "react-joyride";
import { Plus } from "lucide-react";
import {
  DndContext,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { BoardHeader } from "@/components/feature/board/BoardHeader";
import { FilterBar } from "@/components/feature/board/FilterBar";
import { BoardColumn } from "@/components/feature/board/BoardColumn";
import { DraggableBoardCard } from "@/components/ui/DraggableBoardCard";
import { Task } from "@/components/ui/TaskCard";
import { cn } from "@/lib/utils";

// --- Config ---
type ColumnKey = "planning" | "monitoring" | "controlling" | "reflection";

const COLUMN_CONFIG: Record<ColumnKey, {
  title: string;
  dotColorClass: string;
  badgeColorClass: string;
  statusColorClass: string;
  progressBgClass: string;
  isCompleted: boolean;
}> = {
  planning: {
    title: "Planning",
    dotColorClass: "bg-planning shadow-[0_0_8px_var(--color-planning)]",
    badgeColorClass: "text-primary bg-blue-100",
    statusColorClass: "border-l-planning",
    progressBgClass: "bg-planning/20",
    isCompleted: false,
  },
  monitoring: {
    title: "Monitoring",
    dotColorClass: "bg-monitoring shadow-[0_0_8px_var(--color-monitoring)]",
    badgeColorClass: "text-white bg-monitoring",
    statusColorClass: "border-l-monitoring",
    progressBgClass: "bg-monitoring/10",
    isCompleted: false,
  },
  controlling: {
    title: "Controlling",
    dotColorClass: "bg-controlling shadow-[0_0_8px_var(--color-controlling)]",
    badgeColorClass: "text-white bg-controlling",
    statusColorClass: "border-l-controlling",
    progressBgClass: "bg-controlling/10",
    isCompleted: false,
  },
  reflection: {
    title: "Reflection",
    dotColorClass: "bg-reflection shadow-[0_0_8px_var(--color-reflection)]",
    badgeColorClass: "text-white bg-reflection",
    statusColorClass: "border-l-reflection",
    progressBgClass: "bg-reflection/10",
    isCompleted: true,
  },
};

const COLUMN_KEYS: ColumnKey[] = ["planning", "monitoring", "controlling", "reflection"];

// --- Dummy data ---
const DUMMY_TASKS: Record<string, Task> = {
  "task-1": {
    id: "task-1",
    title: "Bab 1: Pengantar AI",
    course: "IF-401 Kecerdasan Buatan",
    description: "Membaca dan meringkas bab 1 tentang sejarah dan konsep dasar AI",
    progressText: "0/3",
    progressPercent: 0,
    priority: "High",
    difficulty: "Medium",
    time: "Besok",
    subtasks: [
      { id: "s1", title: "Baca halaman 1-20", isCompleted: false },
      { id: "s2", title: "Buat ringkasan", isCompleted: false },
      { id: "s3", title: "Catat pertanyaan", isCompleted: false },
    ],
  },
  "task-2": {
    id: "task-2",
    title: "Tugas Klasifikasi",
    course: "IF-302 Machine Learning",
    description: "Implementasi algoritma Naive Bayes untuk dataset iris",
    progressText: "1/4",
    progressPercent: 25,
    priority: "Medium",
    difficulty: "Hard",
    time: "Jumat",
    subtasks: [
      { id: "s4", title: "Siapkan dataset", isCompleted: true },
      { id: "s5", title: "Implementasi kode", isCompleted: false },
      { id: "s6", title: "Evaluasi model", isCompleted: false },
      { id: "s7", title: "Tulis laporan", isCompleted: false },
    ],
  },
  "task-3": {
    id: "task-3",
    title: "Review Jurnal",
    course: "IF-305 Penelitian Ilmiah",
    progressText: "2/2",
    progressPercent: 100,
    priority: "Low",
    difficulty: "Easy",
    time: "3 hari lagi",
    subtasks: [
      { id: "s8", title: "Baca jurnal", isCompleted: true },
      { id: "s9", title: "Tulis review", isCompleted: true },
    ],
  },
};

const DUMMY_COLUMNS: Record<ColumnKey, string[]> = {
  planning: ["task-1"],
  monitoring: ["task-2"],
  controlling: ["task-3"],
  reflection: [],
};

const DUMMY_FILTERS = ["All", "IF-401", "IF-302", "IF-305"];

// --- Joyride steps ---
const steps = [
  {
    target: "#guide-board-header",
    content: "Ini adalah Kanban Board — pusat kendali belajarmu. Semua tugas diatur di sini.",
    disableBeacon: true,
  },
  {
    target: "#guide-board-columns",
    content: "Ada 4 kolom: Planning → Monitoring → Controlling → Reflection. Pindahkan kartu tugas ke kolom sesuai progresmu.",
    disableBeacon: true,
  },
  {
    target: "#guide-fab-button",
    content: "Tap tombol ini untuk menambah tugas baru.",
    disableBeacon: true,
  },
  {
    target: "#guide-board-card",
    content: "Geser kartu ke kanan/kiri untuk memindahkan tugas antar kolom. Atau drag & drop.",
    disableBeacon: true,
  },
];

export default function GuideStep1Page() {
  const router = useRouter();
  const [run] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const handleJoyrideCallback = (data: { status: string }) => {
    if (data.status === STATUS.FINISHED) {
      router.push("/onboarding/guide/step-2");
    }
  };

  // Filter columns based on activeFilter
  const filteredColumns = useMemo(() => {
    const result: Record<ColumnKey, Task[]> = {} as Record<ColumnKey, Task[]>;
    for (const col of COLUMN_KEYS) {
      const colTasks = DUMMY_COLUMNS[col].map((id) => DUMMY_TASKS[id]).filter(Boolean);
      result[col] = colTasks;
    }
    return result;
  }, []);

  return (
    <div className="w-full h-screen bg-neutral-50 flex flex-col font-sans text-neutral-800 relative overflow-hidden max-w-md mx-auto">
      {/* Progress bar */}
      <div className="shrink-0 pt-3 px-5 bg-white">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Langkah 1 dari 5</span>
          <span className="text-[10px] font-bold text-primary">20%</span>
        </div>
        <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: "20%" }} />
        </div>
      </div>

      {/* Board Header — actual component */}
      <div id="guide-board-header">
        <BoardHeader userName="Student" activeTasksCount={3} hasUnreadNotifications={false} />
      </div>

      <FilterBar filters={DUMMY_FILTERS} activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {/* Kanban columns — actual components */}
      <DndContext sensors={sensors} collisionDetection={closestCorners}>
        <div
          id="guide-board-columns"
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto overflow-y-hidden snap-x snap-mandatory flex no-scrollbar relative w-full h-[calc(100vh-240px)] [&>section]:lg:!w-[85vw] [&>section]:lg:!max-w-[340px] [&>section]:lg:!shrink-0 [&>section]:lg:!snap-center [&>section]:lg:!min-w-0 [&>section]:lg:!rounded-xl [&>section]:lg:!border-0 [&>section]:lg:!bg-transparent"
        >
          {COLUMN_KEYS.map((colKey) => {
            const config = COLUMN_CONFIG[colKey];
            const colTasks = filteredColumns[colKey];
            return (
              <BoardColumn
                key={colKey}
                id={colKey}
                title={config.title}
                count={colTasks.length}
                dotColorClass={config.dotColorClass}
                badgeColorClass={config.badgeColorClass}
              >
                <SortableContext items={colTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                  {colTasks.map((task, i) => (
                    <div key={task.id} id={colKey === "planning" && i === 0 ? "guide-board-card" : undefined}>
                      <DraggableBoardCard
                        task={task}
                        statusColorClass={config.statusColorClass}
                        progressBgClass={config.progressBgClass}
                        isCompleted={config.isCompleted}
                        showFocusButton={colKey === "monitoring"}
                      />
                    </div>
                  ))}
                </SortableContext>
                {colTasks.length === 0 && (
                  <div className="border-2 border-dashed border-neutral-200 rounded-3xl p-5 flex flex-col items-center justify-center gap-2 min-h-[120px]">
                    <Plus className="w-5 h-5 text-neutral-300" />
                    <span className="text-xs font-medium text-neutral-300">Tambah tugas</span>
                  </div>
                )}
              </BoardColumn>
            );
          })}
        </div>
      </DndContext>

      {/* FAB */}
      <div id="guide-fab-button" className="fixed right-5 bottom-24 w-14 h-14 bg-primary text-white rounded-full shadow-[0_4px_16px_rgba(59,130,246,0.5)] flex items-center justify-center z-30">
        <Plus className="w-6 h-6" />
      </div>

      {/* Joyride */}
      <Joyride
        run={run}
        steps={steps}
        continuous={true}
        options={{
          showProgress: true,
          primaryColor: "#3b82f6",
          backgroundColor: "#ffffff",
          textColor: "#262626",
          arrowColor: "#ffffff",
          skipBeacon: true,
          width: 320,
        }}
        styles={{
          tooltipContainer: { textAlign: "left" },
          buttonPrimary: { background: "#3b82f6" },
        }}
        locale={{ last: "Selesai" }}
        onEvent={handleJoyrideCallback}
      />
    </div>
  );
}

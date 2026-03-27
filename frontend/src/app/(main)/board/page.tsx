"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  DragMoveEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { BoardHeader } from "@/components/feature/board/BoardHeader";
import { FilterBar } from "@/components/feature/board/FilterBar";
import { BoardColumn } from "@/components/feature/board/BoardColumn";
import { DraggableBoardCard } from "@/components/ui/DraggableBoardCard";
import { Task } from "@/components/ui/TaskCard";

// --- Types ---
type ColumnKey = "planning" | "monitoring" | "controlling" | "reflection";

interface ColumnConfig {
  title: string;
  dotColorClass: string;
  badgeColorClass: string;
  statusColorClass: string;
  progressBgClass: string;
  isCompleted: boolean;
}

const COLUMN_CONFIG: Record<ColumnKey, ColumnConfig> = {
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

// --- Mock Data ---
const INITIAL_TASKS: Task[] = [
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
];

const INITIAL_COLUMNS: Record<ColumnKey, string[]> = {
  planning: ["task-1", "task-2"],
  monitoring: ["task-3", "task-4"],
  controlling: ["task-5"],
  reflection: ["task-6"],
};

function findColumn(taskId: string | number, columns: Record<ColumnKey, string[]>): ColumnKey | null {
  for (const col of COLUMN_KEYS) {
    if (columns[col].includes(taskId as string)) return col;
  }
  return null;
}

function KanbanBoardContent() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [tasks] = useState<Task[]>(INITIAL_TASKS);
  const [columns, setColumns] = useState<Record<ColumnKey, string[]>>(INITIAL_COLUMNS);
  const [activeTaskId, setActiveTaskId] = useState<string | number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentVisibleCol = useRef(0);
  const pointerXRef = useRef(0); // latest pointer X (viewport coords)
  const snapCooldownRef = useRef(false); // prevent rapid snapping
  const activeTaskIdRef = useRef<string | number | null>(null); // ref for auto-advance
  const SNAP_COOLDOWN = 600; // ms pause before next auto-advance snap
  const EDGE_ZONE = 0.10; // 10% from viewport edge triggers snap

  const taskMap = Object.fromEntries(tasks.map((t) => [t.id, t]));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const totalTasks = Object.values(columns).flat().length;

  // Filtered columns
  const filteredColumns: Record<ColumnKey, Task[]> = {} as Record<ColumnKey, Task[]>;
  for (const col of COLUMN_KEYS) {
    const colTasks = columns[col]
      .map((id) => taskMap[id])
      .filter(Boolean);

    if (activeFilter !== "All") {
      filteredColumns[col] = colTasks.filter((t) =>
        t.course?.toLowerCase().includes(activeFilter.toLowerCase())
      );
    } else {
      filteredColumns[col] = colTasks;
    }
  }

  // --- Snappy column-by-column scroll during drag ---
  // Sync currentVisibleCol with actual scroll position (for when user scrolls without dragging)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const updateVisibleCol = () => {
      const cw = container.getBoundingClientRect().width;
      const scrollLeft = container.scrollLeft;
      const idx = Math.round(scrollLeft / cw);
      currentVisibleCol.current = Math.max(0, Math.min(idx, COLUMN_KEYS.length - 1));
    };

    container.addEventListener("scroll", updateVisibleCol, { passive: true });
    return () => container.removeEventListener("scroll", updateVisibleCol);
  }, []);

  // Lock scroll during drag, unlock on end
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (isDragging) {
      container.style.overflowX = "hidden";
      container.style.scrollSnapType = "none";
    } else {
      container.style.overflowX = "auto";
      container.style.scrollSnapType = "x mandatory";
    }
  }, [isDragging]);

  const snapToColumn = useCallback((colIndex: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const clamped = Math.max(0, Math.min(colIndex, COLUMN_KEYS.length - 1));
    if (clamped === currentVisibleCol.current) return;

    const columnEl = container.children[clamped] as HTMLElement | undefined;
    if (!columnEl) return;

    currentVisibleCol.current = clamped;
    container.scrollTo({
      left: columnEl.offsetLeft,
      behavior: "smooth",
    });
  }, []);

  // Move active card from its current column to a target column
  const moveCardToColumn = useCallback((targetCol: ColumnKey) => {
    const taskId = activeTaskIdRef.current;
    if (!taskId) return;

    setColumns((prev) => {
      const sourceCol = findColumn(taskId, prev);
      if (!sourceCol || sourceCol === targetCol) return prev;

      const sourceItems = [...prev[sourceCol]];
      const sourceIndex = sourceItems.indexOf(taskId as string);
      if (sourceIndex === -1) return prev;
      sourceItems.splice(sourceIndex, 1);

      return {
        ...prev,
        [sourceCol]: sourceItems,
        [targetCol]: [...prev[targetCol], taskId as string],
      };
    });
  }, []);

  // Auto-advance: when pointer is held at viewport edge, keep snapping
  useEffect(() => {
    if (!isDragging) return;

    const tick = () => {
      if (snapCooldownRef.current) return;

      const container = scrollContainerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const relX = pointerXRef.current - containerRect.left;
      const containerWidth = containerRect.width;
      const edgeThreshold = containerWidth * EDGE_ZONE;

      if (relX > containerWidth - edgeThreshold && currentVisibleCol.current < COLUMN_KEYS.length - 1) {
        const nextColIdx = currentVisibleCol.current + 1;
        const nextColKey = COLUMN_KEYS[nextColIdx];
        moveCardToColumn(nextColKey);
        snapToColumn(nextColIdx);
        snapCooldownRef.current = true;
        setTimeout(() => { snapCooldownRef.current = false; }, SNAP_COOLDOWN);
      } else if (relX < edgeThreshold && currentVisibleCol.current > 0) {
        const prevColIdx = currentVisibleCol.current - 1;
        const prevColKey = COLUMN_KEYS[prevColIdx];
        moveCardToColumn(prevColKey);
        snapToColumn(prevColIdx);
        snapCooldownRef.current = true;
        setTimeout(() => { snapCooldownRef.current = false; }, SNAP_COOLDOWN);
      }
    };

    const interval = setInterval(tick, 150);
    return () => clearInterval(interval);
  }, [isDragging, snapToColumn, moveCardToColumn]);

  // --- DnD Handlers ---
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const container = scrollContainerRef.current;
    if (container) {
      const containerWidth = container.getBoundingClientRect().width;
      currentVisibleCol.current = Math.round(container.scrollLeft / containerWidth);
    }
    const startRect = event.active.rect.current.initial;
    if (startRect) {
      pointerXRef.current = startRect.left + startRect.width / 2;
    }
    snapCooldownRef.current = false;
    activeTaskIdRef.current = event.active.id;
    setActiveTaskId(event.active.id);
    setIsDragging(true);
  }, []);

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    if (!isDragging) return;
    const activeRect = event.active.rect.current.translated;
    if (!activeRect) return;
    // Track pointer position (card center ≈ finger position)
    pointerXRef.current = activeRect.left + activeRect.width / 2;
  }, [isDragging]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const sourceCol = findColumn(activeId, columns);
    const destCol = findColumn(overId, columns);

    if (!sourceCol || !destCol || sourceCol === destCol) return;

    setColumns((prev) => {
      const sourceItems = [...prev[sourceCol]];
      const destItems = [...prev[destCol]];

      const activeIndex = sourceItems.indexOf(activeId);
      sourceItems.splice(activeIndex, 1);

      const overIndex = destItems.indexOf(overId);
      destItems.splice(overIndex >= 0 ? overIndex : destItems.length, 0, activeId);

      return {
        ...prev,
        [sourceCol]: sourceItems,
        [destCol]: destItems,
      };
    });
  }, [columns]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    activeTaskIdRef.current = null;
    setActiveTaskId(null);
    setIsDragging(false);

    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const sourceCol = findColumn(activeId, columns);

    if (COLUMN_KEYS.includes(overId as ColumnKey)) {
      if (sourceCol && sourceCol !== (overId as ColumnKey)) {
        setColumns((prev) => {
          const sourceItems = [...prev[sourceCol]];
          const sourceIndex = sourceItems.indexOf(activeId);
          sourceItems.splice(sourceIndex, 1);

          return {
            ...prev,
            [sourceCol]: sourceItems,
            [overId as ColumnKey]: [...prev[overId as ColumnKey], activeId],
          };
        });
      }
      return;
    }

    if (!sourceCol) return;
    setColumns((prev) => {
      const items = [...prev[sourceCol]];
      const oldIndex = items.indexOf(activeId);
      const newIndex = items.indexOf(overId);

      if (oldIndex === -1 || newIndex === -1) return prev;

      items.splice(oldIndex, 1);
      items.splice(newIndex, 0, activeId);

      return { ...prev, [sourceCol]: items };
    });
  }, [columns]);

  const handleDragCancel = useCallback(() => {
    activeTaskIdRef.current = null;
    setActiveTaskId(null);
    setIsDragging(false);
  }, []);

  const activeTask = activeTaskId ? taskMap[activeTaskId as string] : null;

  return (
    <>
      <BoardHeader
        userName="Student"
        activeTasksCount={totalTasks}
        hasUnreadNotifications={true}
      />

      <FilterBar
        filters={["All", "CS101", "MATH201", "ENG105", "PHY102"]}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {/* Kanban Board Area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto overflow-y-hidden snap-x snap-mandatory flex no-scrollbar relative w-full h-[calc(100vh-200px)]"
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
                <SortableContext
                  items={colTasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {colTasks.map((task) => (
                    <DraggableBoardCard
                      key={task.id}
                      task={task}
                      statusColorClass={config.statusColorClass}
                      progressBgClass={config.progressBgClass}
                      isCompleted={config.isCompleted}
                    />
                  ))}
                </SortableContext>
              </BoardColumn>
            );
          })}
        </div>

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <DraggableBoardCard
              task={activeTask}
              statusColorClass={
                COLUMN_CONFIG[
                  (findColumn(activeTask.id, columns) || "planning") as ColumnKey
                ].statusColorClass
              }
              progressBgClass={
                COLUMN_CONFIG[
                  (findColumn(activeTask.id, columns) || "planning") as ColumnKey
                ].progressBgClass
              }
              isDragOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Floating Action Button */}
      <Link
        href="/task/new"
        className="fixed right-5 bottom-24 w-14 h-14 bg-primary text-white rounded-full shadow-[0_4px_16px_rgba(59,130,246,0.5)] flex items-center justify-center hover:bg-primary-hover active:scale-95 transition-all z-30"
        aria-label="Add new task"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </>
  );
}

// dnd-kit generates non-deterministic aria-describedby IDs on SSR vs client.
const KanbanBoardPage = dynamic(
  () => Promise.resolve(KanbanBoardContent),
  { ssr: false }
);

export default KanbanBoardPage;

"use client";

import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
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
import { useAuthStore } from "@/stores/auth";
import { useBoardStore } from "@/stores/board";
import { useNotificationsStore } from "@/stores/notifications";
import type { BoardCard } from "@/types";

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
  const subtasks = card.subtasks || [];
  const completed = subtasks.filter((s) => s.isCompleted).length;
  const total = subtasks.length;
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
    subtasks,
  };
}

function findColumn(taskId: string | number, columns: Record<ColumnKey, string[]>): ColumnKey | null {
  for (const col of COLUMN_KEYS) {
    if (columns[col].includes(taskId as string)) return col;
  }
  return null;
}

function KanbanBoardContent() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeTaskId, setActiveTaskId] = useState<string | number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Store selectors
  const { user } = useAuthStore();
  const { tasks: boardTasks, columns: storeColumns, loading, fetchBoard, moveCard, reorderColumn } = useBoardStore();
  const { unreadCount } = useNotificationsStore();

  // Local columns state (synced from store, updated during drag, persisted on end)
  const [columns, setColumns] = useState<Record<ColumnKey, string[]>>(storeColumns);

  // Sync store columns into local state when store data changes (e.g. on initial load)
  useEffect(() => {
    setColumns(storeColumns);
  }, [storeColumns]);

  // Fetch board on mount
  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentVisibleCol = useRef(0);
  const pointerXRef = useRef(0);
  const snapCooldownRef = useRef(false);
  const activeTaskIdRef = useRef<string | number | null>(null);
  const originalColumnRef = useRef<ColumnKey | null>(null);
  const columnsRef = useRef(columns);
  const SNAP_COOLDOWN = 600;
  const EDGE_ZONE = 0.10;

  // Map BoardCard records to Task records for components
  const taskMap: Record<string, Task> = useMemo(() => {
    const map: Record<string, Task> = {};
    for (const [id, card] of Object.entries(boardTasks)) {
      map[id] = boardCardToTask(card);
    }
    return map;
  }, [boardTasks]);

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

  // Derive course filters from unique course_name values
  const filters = useMemo(() => {
    const courseNames = new Set<string>();
    for (const card of Object.values(boardTasks)) {
      if (card.course_name) courseNames.add(card.course_name);
    }
    return ["All", ...Array.from(courseNames).sort()];
  }, [boardTasks]);

  // Derived data for header
  const userName = user?.name || "Student";
  const hasUnreadNotifications = unreadCount > 0;

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

      const next = {
        ...prev,
        [sourceCol]: sourceItems,
        [targetCol]: [...prev[targetCol], taskId as string],
      };
      columnsRef.current = next;
      return next;
    });
  }, []);

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
    originalColumnRef.current = findColumn(event.active.id, columns);
    setActiveTaskId(event.active.id);
    setIsDragging(true);
  }, [columns]);

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    if (!isDragging) return;
    const activeRect = event.active.rect.current.translated;
    if (!activeRect) return;
    pointerXRef.current = activeRect.left + activeRect.width / 2;
  }, [isDragging]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    setColumns((prev) => {
      const sourceCol = findColumn(activeId, prev);
      // overId can be a ColumnKey (column container) or a card ID
      const destCol: ColumnKey | null = COLUMN_KEYS.includes(overId as ColumnKey)
        ? (overId as ColumnKey)
        : findColumn(overId, prev);

      if (!sourceCol || !destCol || sourceCol === destCol) return prev;

      const sourceItems = [...prev[sourceCol]];
      const destItems = [...prev[destCol]];
      const activeIndex = sourceItems.indexOf(activeId);
      if (activeIndex === -1) return prev;

      sourceItems.splice(activeIndex, 1);
      const overIndex = destItems.indexOf(overId);
      destItems.splice(overIndex >= 0 ? overIndex : destItems.length, 0, activeId);

      const next = { ...prev, [sourceCol]: sourceItems, [destCol]: destItems };
      columnsRef.current = next;
      return next;
    });
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    const origCol = originalColumnRef.current;
    activeTaskIdRef.current = null;
    originalColumnRef.current = null;
    setActiveTaskId(null);
    setIsDragging(false);

    const activeId = active.id as string;
    const latest = columnsRef.current;

    // Case: no over target (collision detection missed)
    if (!over) {
      const currentCol = findColumn(activeId, latest);
      if (origCol && currentCol && origCol !== currentCol) {
        // handleDragOver already moved card to different column — persist it
        const position = latest[currentCol].indexOf(activeId);
        moveCard(activeId, currentCol, Math.max(0, position));
        return;
      }
      // No move happened — revert
      if (origCol) setColumns(storeColumns);
      return;
    }

    if (active.id === over.id) return;

    const overId = over.id as string;
    const sourceCol = origCol || findColumn(activeId, latest);
    if (!sourceCol) return;

    const finalCol = findColumn(activeId, latest) || sourceCol;

    if (sourceCol !== finalCol) {
      // Cross-column move
      const finalIndex = latest[finalCol].indexOf(activeId);
      const position = finalIndex >= 0 ? finalIndex : latest[finalCol].length - 1;
      moveCard(activeId, finalCol, position);
      return;
    }

    // Same-column reorder
    const items = [...latest[sourceCol]];
    const oldIndex = items.indexOf(activeId);
    const newIndex = items.indexOf(overId);

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
      return;
    }

    items.splice(oldIndex, 1);
    items.splice(newIndex, 0, activeId);

    const newColumns = { ...latest, [sourceCol]: items };
    columnsRef.current = newColumns;
    setColumns(newColumns);
    reorderColumn(sourceCol, items);
  }, [storeColumns, moveCard, reorderColumn]);

  const handleDragCancel = useCallback(() => {
    activeTaskIdRef.current = null;
    setActiveTaskId(null);
    setIsDragging(false);
  }, []);

  const activeTask = activeTaskId ? taskMap[activeTaskId as string] : null;

  // Loading state
  if (loading && totalTasks === 0) {
    return (
      <>
        <BoardHeader
          userName={userName}
          activeTasksCount={0}
          hasUnreadNotifications={hasUnreadNotifications}
        />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-neutral-500 font-medium">Memuat board...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <BoardHeader
        userName={userName}
        activeTasksCount={totalTasks}
        hasUnreadNotifications={hasUnreadNotifications}
      />

      <FilterBar
        filters={filters}
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
                      showFocusButton={colKey === "monitoring"}
                    />
                  ))}
                </SortableContext>
                {colTasks.length === 0 && (
                  <Link
                    href="/task/new"
                    className="block border-2 border-dashed border-neutral-200 rounded-3xl p-5 flex flex-col items-center justify-center gap-2 hover:border-primary/40 hover:bg-primary/5 transition-all min-h-[120px]"
                  >
                    <Plus className="w-5 h-5 text-neutral-300" />
                    <span className="text-xs font-medium text-neutral-300">Tambah tugas</span>
                  </Link>
                )}
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

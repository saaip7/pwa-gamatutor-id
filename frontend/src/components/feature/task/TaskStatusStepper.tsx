"use client";

import React, { useState } from "react";
import { Check, Eye, Settings2, Sparkles, ArrowRightLeft, Loader2, Play, MessageSquareText } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { useBoardStore } from "@/stores/board";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ColumnKey } from "@/types";
import Link from "next/link";

export type TaskStatus = "Planning" | "Monitoring" | "Controlling" | "Reflection";

const STATUS_TO_COLUMN: Record<TaskStatus, ColumnKey> = {
  Planning: "planning",
  Monitoring: "monitoring",
  Controlling: "controlling",
  Reflection: "reflection",
};

const COLUMNS: { status: TaskStatus; key: ColumnKey; label: string }[] = [
  { status: "Planning", key: "planning", label: "Planning" },
  { status: "Monitoring", key: "monitoring", label: "Monitoring" },
  { status: "Controlling", key: "controlling", label: "Controlling" },
  { status: "Reflection", key: "reflection", label: "Reflection" },
];

interface TaskStatusStepperProps {
  currentStatus: TaskStatus;
  taskId?: string;
  onMoved?: (newStatus: TaskStatus) => void;
}

export function TaskStatusStepper({ currentStatus, taskId, onMoved }: TaskStatusStepperProps) {
  const moveCard = useBoardStore((s) => s.moveCard);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showReflectionDrawer, setShowReflectionDrawer] = useState(false);
  const [moving, setMoving] = useState<string | null>(null);

  const steps = [
    { id: "Planning", label: "Planning", icon: Check, activeColor: "bg-blue-500", lightColor: "bg-blue-50", textColor: "text-blue-600" },
    { id: "Monitoring", label: "Monitoring", icon: Eye, activeColor: "bg-amber-500", lightColor: "bg-amber-50", textColor: "text-amber-600" },
    { id: "Controlling", label: "Controlling", icon: Settings2, activeColor: "bg-purple-500", lightColor: "bg-purple-50", textColor: "text-purple-600" },
    { id: "Reflection", label: "Reflection", icon: Sparkles, activeColor: "bg-emerald-500", lightColor: "bg-emerald-50", textColor: "text-emerald-600" },
  ];

  const currentIndex = steps.findIndex(s => s.id === currentStatus);
  const isReflection = currentStatus === "Reflection";
  const isMonitoring = currentStatus === "Monitoring";

  const handleMove = async (targetKey: ColumnKey) => {
    if (!taskId || moving) return;

    if (targetKey === "reflection") {
      setShowReflectionDrawer(true);
      setShowDrawer(false);
      return;
    }

    setMoving(targetKey);
    try {
      await moveCard(taskId, targetKey);
      const col = COLUMNS.find((c) => c.key === targetKey)!;
      toast.success(`Dipindahkan ke ${col.label}`);
      onMoved?.(col.status);
      setShowDrawer(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal memindahkan tugas");
    } finally {
      setMoving(null);
    }
  };

  return (
    <>
      <section className="px-5 py-6 bg-white border-b border-neutral-100">
        <h2 className="text-xs font-black text-neutral-400 mb-6 uppercase tracking-widest">
          Status Saat Ini
        </h2>

        <div className="relative flex justify-between items-start px-2">
          <div className="absolute top-4 left-8 right-8 h-[2px] bg-neutral-100 -z-0 rounded-full" />
          <div
            className="absolute top-4 left-8 h-[2px] bg-amber-400 transition-all duration-500 ease-in-out"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 85}%` }}
          />

          {steps.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const StepIcon = step.icon;

            return (
              <div key={step.id} className="flex flex-col items-center gap-2.5 z-10 w-14">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
                  isCompleted ? "bg-blue-50 border border-blue-200 text-blue-500" :
                  isCurrent ? cn(step.activeColor, "border-2 border-white ring-4 ring-amber-50 text-white scale-110") :
                  "bg-white border-2 border-neutral-100 text-neutral-300"
                )}>
                  <StepIcon className={cn(isCurrent ? "w-4 h-4" : "w-3.5 h-3.5")} strokeWidth={3} />
                </div>
                <span className={cn(
                  "text-[10px] font-bold tracking-tight transition-colors",
                  isCurrent ? step.textColor : "text-neutral-400"
                )}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {!isReflection && (
          <button
            onClick={() => setShowDrawer(true)}
            className="mt-8 w-full py-3.5 rounded-2xl border border-neutral-200 bg-white text-sm font-bold text-neutral-700 flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm"
          >
            <ArrowRightLeft className="w-4 h-4 text-neutral-400" />
            Ubah Status
          </button>
        )}
      </section>

      <Drawer isOpen={showDrawer} onClose={() => setShowDrawer(false)} title="Ubah Status">
        <div className="space-y-3">
          {COLUMNS.map((col) => {
            const isCurrent = col.status === currentStatus;
            const isMovingTo = moving === col.key;
            const step = steps.find((s) => s.id === col.status)!;
            const StepIcon = step.icon;

            return (
              <button
                key={col.key}
                onClick={() => !isCurrent && handleMove(col.key)}
                disabled={isCurrent || !!moving}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left",
                  isCurrent
                    ? "bg-primary/5 border-primary/20 cursor-default"
                    : "bg-white border-neutral-100 active:scale-[0.98] active:border-primary/30"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    isCurrent
                      ? step.activeColor + " text-white"
                      : "bg-neutral-50 border border-neutral-200 text-neutral-400"
                  )}
                >
                  {isMovingTo ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <StepIcon className="w-4 h-4" strokeWidth={2.5} />
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm font-bold flex-1",
                    isCurrent ? "text-primary" : "text-neutral-800"
                  )}
                >
                  {col.label}
                </span>
                {isCurrent && (
                  <span className="text-[10px] font-bold text-primary/60 shrink-0">saat ini</span>
                )}
              </button>
            );
          })}
        </div>
      </Drawer>

      <Drawer isOpen={showReflectionDrawer} onClose={() => setShowReflectionDrawer(false)} title="Selesaikan Tugas">
        <div className="space-y-4 pt-2">
          <p className="text-sm text-neutral-600 font-medium leading-relaxed">
            Kamu belum mengisi refleksi. Pilih cara untuk menyelesaikan tugas ini:
          </p>

          <Link
            href={`/task/${taskId}/reflection?duration=0`}
            onClick={() => setShowReflectionDrawer(false)}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-xl bg-primary/5 border border-primary/20 active:scale-[0.98] transition-all"
          >
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <MessageSquareText className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-neutral-800">Langsung Refleksi</p>
              <p className="text-xs text-neutral-400 mt-0.5">Isi refleksi tanpa sesi fokus</p>
            </div>
          </Link>

          {isMonitoring && (
            <Link
              href={`/task/${taskId}/focus`}
              className="w-full flex items-center gap-3 px-4 py-4 rounded-xl bg-white border border-neutral-100 active:scale-[0.98] transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-center shrink-0">
                <Play className="w-4.5 h-4.5 text-neutral-600 fill-neutral-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-neutral-800">Mulai Sesi Fokus Dulu</p>
                <p className="text-xs text-neutral-400 mt-0.5">Belajar dengan timer, lalu refleksi</p>
              </div>
            </Link>
          )}

          <button
            onClick={() => setShowReflectionDrawer(false)}
            className="w-full py-3 text-sm font-bold text-neutral-400 active:scale-95 transition-all"
          >
            Batal
          </button>
        </div>
      </Drawer>
    </>
  );
}

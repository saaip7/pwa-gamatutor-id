"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRightLeft, Loader2, Play, MessageSquareText } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { useBoardStore } from "@/stores/board";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ColumnKey } from "@/types";
import Link from "next/link";

const COLUMNS: { key: ColumnKey; label: string; beId: string }[] = [
  { key: "planning", label: "Planning", beId: "list1" },
  { key: "monitoring", label: "Monitoring", beId: "list2" },
  { key: "controlling", label: "Controlling", beId: "list3" },
  { key: "reflection", label: "Reflection", beId: "list4" },
];

interface TaskDetailHeaderProps {
  column?: string;
  taskId?: string;
  onMoved?: (newColumn: string) => void;
  disabled?: boolean;
}

export function TaskDetailHeader({ column, taskId, onMoved, disabled }: TaskDetailHeaderProps) {
  const router = useRouter();
  const moveCard = useBoardStore((s) => s.moveCard);
  const [showMoveDrawer, setShowMoveDrawer] = useState(false);
  const [showReflectionDrawer, setShowReflectionDrawer] = useState(false);
  const [moving, setMoving] = useState<string | null>(null);

  const currentBeId = column || "list1";
  const currentIndex = COLUMNS.findIndex((c) => c.beId === currentBeId);
  const isReflection = currentBeId === "list4";
  const isMonitoring = currentBeId === "list2";

  const handleMove = async (targetKey: ColumnKey) => {
    if (!taskId || moving) return;

    if (targetKey === "reflection") {
      setShowReflectionDrawer(true);
      setShowMoveDrawer(false);
      return;
    }

    setMoving(targetKey);
    try {
      await moveCard(taskId, targetKey);
      onMoved?.(COLUMNS.find((c) => c.key === targetKey)!.beId);
      const col = COLUMNS.find((c) => c.key === targetKey)!;
      toast.success(`Dipindahkan ke ${col.label}`);
      setShowMoveDrawer(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal memindahkan tugas");
    } finally {
      setMoving(null);
    }
  };

  return (
    <>
      <header className="shrink-0 pt-14 lg:pt-4 pb-4 px-6 border-b border-neutral-100 flex items-center justify-between bg-white z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-700 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold text-neutral-900">Detail Tugas</h1>
        </div>
        <button
          onClick={() => setShowMoveDrawer(true)}
          disabled={disabled || isReflection}
          title={isReflection ? "Tugas yang sudah di-refleksi tidak bisa dipindah" : "Pindahkan kolom"}
          className={cn(
            "h-9 px-3 flex items-center justify-center gap-1.5 rounded-lg border text-xs font-bold transition-all",
            (disabled || isReflection)
              ? "border-neutral-100 text-neutral-200 cursor-not-allowed"
              : "border-neutral-200 text-neutral-500 active:bg-neutral-50 active:scale-95"
          )}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Pindah</span>
        </button>
      </header>

      <Drawer isOpen={showMoveDrawer} onClose={() => setShowMoveDrawer(false)} title="Pindahkan Kolom">
        <div className="space-y-3">
          {COLUMNS.map((col) => {
            const isCurrent = col.beId === currentBeId;
            const isMovingTo = moving === col.key;

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
                    "w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-[10px] font-black",
                    isCurrent
                      ? "bg-primary text-white"
                      : "bg-neutral-100 text-neutral-500"
                  )}
                >
                  {isMovingTo ? <Loader2 className="w-3 h-3 animate-spin" /> : COLUMNS.indexOf(col) + 1}
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

"use client";

import React, { useState } from "react";
import { Play, Trash2, Edit3, Lightbulb, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Drawer } from "@/components/ui/Drawer";
import { useBoardStore } from "@/stores/board";

interface TaskDetailActionBarProps {
  taskId: string;
  status: string;
  taskName?: string;
}

export function TaskDetailActionBar({ taskId, status, taskName }: TaskDetailActionBarProps) {
  const router = useRouter();
  const deleteCard = useBoardStore((s) => s.deleteCard);
  const isPlanning = status.toLowerCase() === "planning";
  const [showDeleteDrawer, setShowDeleteDrawer] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCard(taskId);
      router.push("/board");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <footer className="shrink-0 pb-[34px] pt-4 px-6 bg-white border-t border-neutral-100 flex flex-col">
        {isPlanning && (
          <p className="text-[11px] text-neutral-500 text-center font-bold mb-4 flex items-center justify-center gap-1.5 bg-amber-50 py-2 rounded-lg border border-amber-100/50">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            Pindahkan ke Monitoring untuk mulai belajar.
          </p>
        )}

        <div className="flex items-center gap-3">
          <Link
            href={`/task/${taskId}/edit`}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-600 active:scale-95 transition-all shrink-0"
          >
            <Edit3 className="w-5 h-5" />
          </Link>

          <Link
            href={`/task/${taskId}/focus`}
            className={cn(
              "flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-base transition-all active:scale-[0.98] shadow-lg",
              isPlanning
                ? "bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200 pointer-events-none"
                : "bg-primary text-white shadow-primary/20"
            )}
          >
            <Play className="w-5 h-5 fill-current" />
            Mulai Sesi Fokus
          </Link>

          <button
            onClick={() => setShowDeleteDrawer(true)}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-50 border border-red-100 text-red-500 active:scale-95 transition-all shrink-0"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </footer>

      <Drawer isOpen={showDeleteDrawer} onClose={() => setShowDeleteDrawer(false)} title="Hapus Tugas?">
        <div className="space-y-6 pt-2">
          <p className="text-sm text-neutral-600 font-medium leading-relaxed">
            Tugas <strong>"{taskName}"</strong> akan dihapus secara permanen. Tindakan ini tidak bisa dibatalkan.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteDrawer(false)}
              className="flex-1 py-4 bg-white border border-neutral-200 text-neutral-700 rounded-2xl font-bold text-sm active:scale-95 transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold text-sm active:scale-95 transition-all disabled:opacity-50"
            >
              {deleting ? "Menghapus..." : "Ya, Hapus"}
            </button>
          </div>
        </div>
      </Drawer>
    </>
  );
}

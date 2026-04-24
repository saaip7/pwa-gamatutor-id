"use client";

import React, { useState } from "react";
import { Play, Trash2, Edit3, Lightbulb, Archive, ArchiveRestore } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Drawer } from "@/components/ui/Drawer";
import { useBoardStore } from "@/stores/board";
import { useFocusSessionStore } from "@/stores/focusSession";

interface TaskDetailActionBarProps {
  taskId: string;
  status: string;
  taskName?: string;
  isArchived?: boolean;
}

export function TaskDetailActionBar({ taskId, status, taskName, isArchived = false }: TaskDetailActionBarProps) {
  const router = useRouter();
  const deleteCard = useBoardStore((s) => s.deleteCard);
  const updateCard = useBoardStore((s) => s.updateCard);
  const activeCardId = useFocusSessionStore((s) => s.cardId);
  const sessionActive = useFocusSessionStore((s) => s.isActive);
  const pendingReflection = useFocusSessionStore((s) => s.pendingReflection);

  const isPlanning = status.toLowerCase() === "planning";
  const isMonitoring = status.toLowerCase() === "monitoring";
  const isReflection = status.toLowerCase() === "reflection";
  const isThisCard = activeCardId === taskId;
  const isFocusBlocked = sessionActive && !isThisCard;
  const hasPendingReflection = pendingReflection?.cardId === taskId;

  const [showDeleteDrawer, setShowDeleteDrawer] = useState(false);
  const [showArchiveDrawer, setShowArchiveDrawer] = useState(false);
  const [showUnarchiveDrawer, setShowUnarchiveDrawer] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [unarchiving, setUnarchiving] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCard(taskId);
      router.push("/board");
    } finally {
      setDeleting(false);
    }
  };

  const handleArchive = async () => {
    setArchiving(true);
    try {
      await updateCard(taskId, { archived: true });
      router.push("/board");
    } finally {
      setArchiving(false);
    }
  };

  const handleUnarchive = async () => {
    setUnarchiving(true);
    try {
      await updateCard(taskId, { archived: false });
      toast.success("Tugas berhasil dipulihkan");
      router.push("/board");
    } finally {
      setUnarchiving(false);
    }
  };

  // Determine primary action
  const primaryAction = (() => {
    // Priority 1: Pending reflection — resume
    if (hasPendingReflection) {
      return (
        <button
          onClick={() => router.push(`/task/${taskId}/reflection?duration=${pendingReflection!.duration}`)}
          className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-base bg-amber-500 text-white shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all"
        >
          Lanjutkan Refleksi
        </button>
      );
    }

    // Priority 2: Reflection column — archive
    if (isReflection) {
      return (
        <button
          onClick={() => setShowArchiveDrawer(true)}
          className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-base bg-neutral-900 text-white shadow-lg shadow-neutral-900/20 active:scale-[0.98] transition-all"
        >
          <Archive className="w-5 h-5" />
          Arsipkan
        </button>
      );
    }

    // Priority 3: Focus session (only for monitoring)
    if (isMonitoring) {
      if (isFocusBlocked) {
        return (
          <button
            disabled
            className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-base bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200"
          >
            <Play className="w-5 h-5" />
            Sesi Lain Aktif
          </button>
        );
      }

      return (
        <Link
          href={`/task/${taskId}/focus`}
          className={cn(
            "flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-base transition-all active:scale-[0.98] shadow-lg",
            isThisCard
              ? "bg-emerald-600 text-white shadow-emerald-600/20"
              : "bg-primary text-white shadow-primary/20"
          )}
        >
          <Play className="w-5 h-5 fill-current" />
          {isThisCard ? "Lanjutkan Fokus" : "Mulai Sesi Fokus"}
        </Link>
      );
    }

    // Planning or controlling — disabled focus
    return (
      <button
        disabled
        className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-base bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200"
      >
        <Play className="w-5 h-5" />
        {isPlanning ? "Pindahkan ke Monitoring" : "Sesi Tidak Tersedia"}
      </button>
    );
  })();

  // Archived mode: show only the restore button
  if (isArchived) {
    return (
      <>
         <footer className="shrink-0 pb-[34px] lg:pb-4 pt-4 px-6 bg-white border-t border-neutral-100 flex flex-col">
          <button
            onClick={() => setShowUnarchiveDrawer(true)}
            className="w-full h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-base bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all"
          >
            <ArchiveRestore className="w-5 h-5" />
            Pulihkan
          </button>
        </footer>

        {/* Unarchive Confirmation Drawer */}
        <Drawer isOpen={showUnarchiveDrawer} onClose={() => setShowUnarchiveDrawer(false)} title="Pulihkan Tugas?">
          <div className="space-y-6 pt-2">
            <p className="text-sm text-neutral-600 font-medium leading-relaxed">
              Tugas akan dikembalikan ke board dan muncul kembali di kolom sebelumnya.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUnarchiveDrawer(false)}
                className="flex-1 py-4 bg-white border border-neutral-200 text-neutral-700 rounded-2xl font-bold text-sm active:scale-95 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleUnarchive}
                disabled={unarchiving}
                className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm active:scale-95 transition-all disabled:opacity-50"
              >
                {unarchiving ? "Memulihkan..." : "Ya, Pulihkan"}
              </button>
            </div>
          </div>
        </Drawer>
      </>
    );
  }

  return (
    <>
       <footer className="shrink-0 pb-[34px] lg:pb-4 pt-4 px-6 bg-white border-t border-neutral-100 flex flex-col">

        {isPlanning && !hasPendingReflection && (
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

          {primaryAction}

          <button
            onClick={() => setShowDeleteDrawer(true)}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-50 border border-red-100 text-red-500 active:scale-95 transition-all shrink-0"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </footer>

      {/* Delete Confirmation Drawer */}
      <Drawer isOpen={showDeleteDrawer} onClose={() => setShowDeleteDrawer(false)} title="Hapus Tugas?">
        <div className="space-y-5 pt-2">
          <p className="text-sm text-neutral-600 font-medium leading-relaxed">
            Tugas <strong>"{taskName}"</strong> akan dihapus secara permanen.
          </p>

          {/* Data loss warning card */}
          <div className="bg-red-50/80 border border-red-100 rounded-2xl p-4">
            <p className="text-xs text-red-700/80 font-medium leading-relaxed">
              Semua data terkait tugas ini akan ikut terhapus, termasuk sesi belajar, personal best, statistik belajar, data refleksi, dan catatan.
            </p>
          </div>

          {/* Archive suggestion */}
          <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4">
            <p className="text-xs text-neutral-500 font-medium leading-relaxed">
              <span className="font-bold text-neutral-700">Ingin menyimpan datanya?</span> Pilih <strong>Arsipkan</strong> sebagai pengganti hapus — semua data analitik tetap tersimpan.
            </p>
          </div>

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

      {/* Archive Confirmation Drawer */}
      <Drawer isOpen={showArchiveDrawer} onClose={() => setShowArchiveDrawer(false)} title="Arsipkan Tugas?">
        <div className="space-y-6 pt-2">
          <p className="text-sm text-neutral-600 font-medium leading-relaxed">
            Tugas <strong>"{taskName}"</strong> akan dipindahkan ke arsip. Tugas tidak akan muncul di board lagi.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowArchiveDrawer(false)}
              className="flex-1 py-4 bg-white border border-neutral-200 text-neutral-700 rounded-2xl font-bold text-sm active:scale-95 transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleArchive}
              disabled={archiving}
              className="flex-1 py-4 bg-neutral-900 text-white rounded-2xl font-bold text-sm active:scale-95 transition-all disabled:opacity-50"
            >
              {archiving ? "Mengarsipkan..." : "Ya, Arsipkan"}
            </button>
          </div>
        </div>
      </Drawer>
    </>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Archive, ArchiveRestore, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Drawer } from "@/components/ui/Drawer";
import { toast } from "sonner";
import { useBoardStore } from "@/stores/board";
import type { BoardCard } from "@/types";

const DIFFICULTY_STYLES: Record<string, string> = {
  Hard: "bg-rose-50 text-rose-600 border-rose-100",
  Medium: "bg-amber-50 text-amber-600 border-amber-100",
  Easy: "bg-emerald-50 text-emerald-600 border-emerald-100",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  Hard: "Sulit",
  Medium: "Sedang",
  Easy: "Mudah",
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ArchivePage() {
  const router = useRouter();
  const { archivedCards, fetchArchived, loading } = useBoardStore();

  useEffect(() => {
    fetchArchived();
  }, [fetchArchived]);

  return (
    <div className="w-full h-screen flex flex-col mx-auto bg-white relative overflow-hidden max-w-md">
      {/* Header */}
      <header className="shrink-0 pt-14 pb-3 px-5 border-b border-neutral-100 flex items-center gap-3 bg-white z-50">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-50 border border-neutral-100 text-neutral-600 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-neutral-900">Arsip Tugas</h1>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-5 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : archivedCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center">
              <Archive className="w-7 h-7 text-neutral-300" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-neutral-400">Belum ada tugas diarsipkan</p>
              <p className="text-xs text-neutral-300 mt-1 font-medium">
                Tugas yang diarsipkan akan muncul di sini
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {archivedCards.map((card) => (
              <ArchiveListItem key={card.id} card={card} onRestored={fetchArchived} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ArchiveListItem({ card, onRestored }: { card: BoardCard; onRestored: () => void }) {
  const router = useRouter();
  const updateCard = useBoardStore((s) => s.updateCard);
  const difficulty = card.difficulty || "Medium";
  const column = card.column || "list1";

  const [showRestoreDrawer, setShowRestoreDrawer] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await updateCard(card.id, { archived: false });
      toast.success("Tugas dipulihkan");
      onRestored();
    } catch {
      toast.error("Gagal memulihkan tugas");
    } finally {
      setRestoring(false);
      setShowRestoreDrawer(false);
    }
  };

  return (
    <>
      <div className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl bg-white border border-neutral-100 shadow-sm active:scale-[0.98] transition-all">
        {/* Left color indicator */}
        <div
          className={cn(
            "w-1 h-10 rounded-full shrink-0",
            column === "list1" ? "bg-planning"
              : column === "list2" ? "bg-monitoring"
              : column === "list3" ? "bg-controlling"
              : "bg-reflection"
          )}
        />

        {/* Content - tappable area to view task */}
        <button
          onClick={() => router.push(`/task/${card.id}`)}
          className="flex-1 min-w-0 text-left"
        >
          <p className="text-sm font-bold text-neutral-900 truncate">
            {card.task_name || "Tanpa Judul"}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {card.course_name && (
              <span className="text-[11px] font-medium text-neutral-400 truncate">
                {card.course_name}
              </span>
            )}
          </div>
        </button>

        {/* Right: difficulty + date */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span
            className={cn(
              "px-2 py-0.5 rounded text-[10px] font-bold border",
              DIFFICULTY_STYLES[difficulty]
            )}
          >
            {DIFFICULTY_LABELS[difficulty] || "Sedang"}
          </span>
          {card.updated_at && (
            <span className="text-[10px] text-neutral-300 font-medium flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />
              {formatDate(card.updated_at)}
            </span>
          )}
        </div>

        {/* Restore button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowRestoreDrawer(true);
          }}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-neutral-50 border border-neutral-100 text-neutral-400 active:scale-90 transition-all shrink-0"
        >
          <ArchiveRestore className="w-4 h-4" />
        </button>
      </div>

      {/* Restore Confirmation Drawer */}
      <Drawer isOpen={showRestoreDrawer} onClose={() => setShowRestoreDrawer(false)} title="Pulihkan Tugas?">
        <div className="space-y-6 pt-2">
          <p className="text-sm text-neutral-600 font-medium leading-relaxed">
            Tugas <strong>"{card.task_name || "Tanpa Judul"}"</strong> akan dikembalikan ke board. Tugas akan muncul kembali di kolom semula.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowRestoreDrawer(false)}
              className="flex-1 py-4 bg-white border border-neutral-200 text-neutral-700 rounded-2xl font-bold text-sm active:scale-95 transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleRestore}
              disabled={restoring}
              className="flex-1 py-4 bg-neutral-900 text-white rounded-2xl font-bold text-sm active:scale-95 transition-all disabled:opacity-50"
            >
              {restoring ? "Memulihkan..." : "Ya, Pulihkan"}
            </button>
          </div>
        </div>
      </Drawer>
    </>
  );
}

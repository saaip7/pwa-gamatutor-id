"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Loader2, Zap } from "lucide-react";
import { useAnalyticsStore } from "@/stores/analytics";
import type { ReflectionNote } from "@/types";
import { cn } from "@/lib/utils";

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return "";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  if (diffMs < 0) return "Baru saja";

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes}m lalu`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}j lalu`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Kemarin";
  if (days < 30) return `${days}h lalu`;

  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export default function ReflectionNotesPage() {
  const router = useRouter();
  const reflectionNotes = useAnalyticsStore((s) => s.reflectionNotes);
  const fetchReflectionNotes = useAnalyticsStore((s) => s.fetchReflectionNotes);
  const loading = useAnalyticsStore((s) => s.loading);

  const initialFetched = useRef(false);

  useEffect(() => {
    if (!initialFetched.current) {
      initialFetched.current = true;
      fetchReflectionNotes();
    }
  }, [fetchReflectionNotes]);

  return (
    <div className="w-full h-screen bg-white flex flex-col mx-auto overflow-hidden relative max-w-md">
      {/* Header */}
      <header className="shrink-0 pt-14 pb-4 px-5 border-b border-neutral-100 flex items-center gap-3 bg-white z-50">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-50 border border-neutral-100 text-neutral-600 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-neutral-900 tracking-tight">Catatan Refleksi</h1>
          <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
            {reflectionNotes ? `${reflectionNotes.length} catatan` : "Memuat..."}
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pt-6 pb-[34px]">
        {/* Loading */}
        {loading && (!reflectionNotes || reflectionNotes.length === 0) && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && reflectionNotes && reflectionNotes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
              <BookOpen className="w-7 h-7 text-neutral-300" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-neutral-700 mb-1">Belum ada catatan</p>
            <p className="text-xs text-neutral-400 max-w-[240px] leading-relaxed">
              Tulis catatan untuk dirimu di masa depan saat menyelesaikan refleksi tugas.
            </p>
          </div>
        )}

        {/* Notes list */}
        {reflectionNotes && reflectionNotes.length > 0 && (
          <div className="space-y-3">
            {reflectionNotes.map((note: ReflectionNote, idx: number) => (
              <motion.article
                key={note.card_id}
                custom={idx}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="bg-neutral-50 border border-neutral-100 rounded-2xl overflow-hidden"
              >
                {/* Quote content */}
                <div className="px-5 pt-5 pb-4">
                  <p className="text-sm text-neutral-700 italic leading-relaxed line-clamp-4">
                    &ldquo;{note.q3_improvement}&rdquo;
                  </p>
                </div>

                {/* Metadata bar */}
                <div className="px-5 py-3 border-t border-neutral-100 bg-white/60 flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-neutral-800 truncate max-w-[140px]">
                    {note.task_name}
                  </span>

                  {note.course_code && (
                    <>
                      <span className="text-[8px] text-neutral-300">&#x2022;</span>
                      <span className="text-[11px] text-neutral-500 font-medium">
                        {note.course_code}
                      </span>
                    </>
                  )}

                  {note.strategy && (
                    <>
                      <span className="text-[8px] text-neutral-300">&#x2022;</span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-primary font-semibold">
                        <Zap className="w-3 h-3" />
                        {note.strategy}
                      </span>
                    </>
                  )}
                </div>

                {/* Date */}
                {note.completed_at && (
                  <div className="px-5 pb-3 pt-0">
                    <span className="text-[10px] text-neutral-400 font-medium">
                      {formatRelativeTime(note.completed_at)}
                      <span className="text-neutral-300 mx-1">&#x2022;</span>
                      {formatDate(note.completed_at)}
                    </span>
                  </div>
                )}
              </motion.article>
            ))}
          </div>
        )}

        <div className="h-6" />
      </main>
    </div>
  );
}

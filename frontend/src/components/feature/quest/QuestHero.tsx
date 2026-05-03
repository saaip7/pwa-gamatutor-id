"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Scroll,
  CheckCircle2,
  Clock,
  Snowflake,
  Star,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuestData } from "@/types";

interface QuestHeroProps {
  quest: QuestData | null;
  loading?: boolean;
  className?: string;
}

const QUEST_TYPE: Record<string, { label: string; icon: React.ElementType }> = {
  deep_study: { label: "Fokus Belajar", icon: Scroll },
  reflection_done: { label: "Refleksi", icon: Star },
  checklist_use: { label: "Checklist", icon: CheckCircle2 },
};

/* ── Main ────────────────────────────────────────────── */

export function QuestHero({ quest, loading, className }: QuestHeroProps) {
  if (loading) {
    return (
      <div
        className={cn("rounded-3xl bg-[var(--primary)] h-[120px] animate-pulse", className)}
      />
    );
  }

  if (!quest) return <EmptyState className={className} />;

  return <ActiveQuest quest={quest} className={className} />;
}

/* ══════════════════════════════════════════════════════
   Active Quest
   ══════════════════════════════════════════════════════ */

function ActiveQuest({ quest, className }: { quest: QuestData; className?: string }) {
  const typeKey = quest.type || "deep_study";
  const cfg = QUEST_TYPE[typeKey] ?? QUEST_TYPE.deep_study;
  const TypeIcon = cfg.icon;

  const progress = quest.progress ?? 0;
  const target = quest.target ?? 1;
  const pct = target > 0 ? Math.min((progress / target) * 100, 100) : 0;
  const isCompleted = quest.status === "completed";
  const isExpired = quest.status === "expired";

  // TODO: remove hardcoded dummy once backend sends real data
  const dummyDesc = "Selesaikan sesi belajar minimal 25 menit sebanyak 3 kali untuk mendapatkan reward";
  const description = quest.description || dummyDesc;

  // TODO: remove hardcoded dummy once backend sends real data
  const dummyTimeLabel = "3 hari lagi";
  const timeLabel = isCompleted
    ? "Selesai!"
    : isExpired
      ? "Waktu habis"
      : (fmtDaysLeft(quest.end_date) || dummyTimeLabel);

  /* reward — hardcoded dummy for now */
  // TODO: uncomment real reward logic once backend sends data
  // const RewardIcon =
  //   quest.reward?.type === "freeze" ? Snowflake
  //   : quest.reward?.type === "quest_item" ? Star
  //   : null;
  // const rewardText =
  //   quest.reward?.type === "freeze"
  //     ? `Streak Freeze +${quest.reward.value ?? 1}`
  //   : quest.reward?.type === "quest_item"
  //     ? "Item Eksklusif"
  //   : null;
  const RewardIcon = Snowflake;
  const rewardText = "Streak Freeze +1";

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] border border-neutral-100",
          isCompleted && "border-emerald-200 bg-emerald-50/50",
          isExpired && "border-neutral-200 bg-neutral-50/50",
        )}
      >
        <div className="relative z-10 px-5 py-4">
          {/* row 1: "Quest Aktif" label (kiri) + type chip badge (kanan) */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {!isCompleted && !isExpired && (
                <span className="relative flex h-[7px] w-[7px]">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75" />
                  <span className="relative inline-flex rounded-full h-[7px] w-[7px] bg-[var(--primary)]" />
                </span>
              )}
              {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              <span className={cn(
                "text-[11px] font-semibold uppercase tracking-[0.07em]",
                isCompleted ? "text-emerald-600" : isExpired ? "text-neutral-400" : "text-[var(--primary)]",
              )}>
                {isCompleted ? "Selesai" : isExpired ? "Kadaluarsa" : "Quest Aktif"}
              </span>
            </div>

            {/* type chip */}
            <div className={cn(
              "shrink-0 inline-flex items-center gap-1.5 rounded-md px-2 py-0.5",
              isCompleted ? "bg-emerald-100" : isExpired ? "bg-neutral-100" : "bg-[var(--primary)]/8",
            )}>
              <TypeIcon className={cn(
                "w-3 h-3",
                isCompleted ? "text-emerald-600" : isExpired ? "text-neutral-400" : "text-[var(--primary)]",
              )} />
              <span className={cn(
                "text-[10px] font-semibold tracking-[0.03em] uppercase",
                isCompleted ? "text-emerald-700" : isExpired ? "text-neutral-500" : "text-[var(--primary)]",
              )}>
                {cfg.label}
              </span>
            </div>
          </div>

          {/* row 2: description */}
          {!isCompleted && (
            <p className="text-[13px] text-neutral-600 leading-relaxed mb-3 line-clamp-2">
              {description}
            </p>
          )}
          {isCompleted && (
            <p className="text-[13px] text-emerald-700 font-medium mb-3">
              Quest berhasil diselesaikan!
            </p>
          )}

          {/* row 3: progress bar */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-[5px] bg-neutral-100 rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  isCompleted ? "bg-emerald-500" : "bg-[var(--primary)]",
                )}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <span className={cn(
              "text-[12px] font-bold tabular-nums shrink-0",
              isCompleted ? "text-emerald-600" : "text-neutral-700",
            )}>
              {progress}/{target}
            </span>
          </div>

          {/* row 4: reward chip (kiri) + time (kanan) */}
          <div className="flex items-center justify-between">
            <div className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1",
              isCompleted ? "bg-emerald-100" : "bg-neutral-50 border border-neutral-100",
            )}>
              <RewardIcon className={cn(
                "w-3.5 h-3.5",
                isCompleted ? "text-emerald-600" : "text-[var(--primary)]",
              )} />
              <span className={cn(
                "text-[11px] font-semibold",
                isCompleted ? "text-emerald-700" : "text-neutral-700",
              )}>
                {rewardText}
              </span>
            </div>

            <div className={cn(
              "flex items-center gap-1.5 text-[11px] font-semibold",
              isCompleted ? "text-emerald-500" : isExpired ? "text-neutral-400" : "text-neutral-500",
            )}>
              <Timer className="w-3.5 h-3.5" />
              {timeLabel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   Empty State
   ══════════════════════════════════════════════════════ */

function EmptyState({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <div className="rounded-3xl bg-white shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] border border-neutral-100 px-5 py-4 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Scroll className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-bold text-neutral-900 tracking-tight">
            Quest Sedang Disiapkan
          </h3>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Selesaikan aktivitas belajarmu untuk membuka quest baru
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────── */

function fmtDaysLeft(endDate?: string | null): string {
  if (!endDate) return "";
  const diffMs = new Date(endDate).getTime() - Date.now();
  if (diffMs <= 0) return "Waktu habis";
  const d = Math.floor(diffMs / 86_400_000);
  if (d > 0) return `${d}h lagi`;
  const h = Math.floor(diffMs / 3_600_000);
  if (h > 0) return `${h}j lagi`;
  const m = Math.floor(diffMs / 60_000);
  return `${m}m lagi`;
}

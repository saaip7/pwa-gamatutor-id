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
          "relative overflow-hidden rounded-3xl",
          isCompleted && "bg-emerald-600",
          isExpired && "bg-neutral-400",
          !isCompleted && !isExpired && "bg-[var(--primary)]",
        )}
      >
        {/* decorative circles */}
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/[0.06] pointer-events-none" />
        <div className="absolute -bottom-10 -left-8 w-32 h-32 rounded-full bg-white/[0.04] pointer-events-none" />

        <div className="relative z-10 px-5 py-4">
          {/* row 1: "Quest Aktif" label (kiri) + type chip badge (kanan) */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {!isCompleted && !isExpired && (
                <span className="w-[6px] h-[6px] rounded-full bg-green-400 shrink-0" />
              )}
              {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-white/80" />}
              <span className="text-[11px] font-medium uppercase tracking-[0.07em] text-white/60">
                {isCompleted ? "Selesai" : isExpired ? "Kadaluarsa" : "Quest Aktif"}
              </span>
            </div>

            {/* type chip — kanan atas, keliatan kyk badge */}
            <div className="shrink-0 inline-flex items-center gap-1.5 bg-white/[0.18] rounded-lg px-2.5 py-1">
              <TypeIcon className="w-3 h-3 text-white/80" />
              <span className="text-[10px] font-semibold text-white tracking-[0.03em] uppercase">
                {cfg.label}
              </span>
            </div>
          </div>

          {/* row 2: title */}
          <h3 className="text-[16px] font-bold text-white leading-snug mb-1">
            {isCompleted ? "Quest Berhasil!" : (quest.title || cfg.label)}
          </h3>

          {/* row 2b: description */}
          {!isCompleted && description && (
            <p className="text-[12px] text-white/60 leading-relaxed mb-3 line-clamp-2">
              {description}
            </p>
          )}

          {/* row 3: progress bar */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-[5px] bg-white/[0.15] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <span className="text-[12px] font-bold text-white tabular-nums shrink-0">
              {progress}/{target}
            </span>
          </div>

          {/* row 4: reward chip (kiri) + time (kanan) */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 bg-white/[0.16] rounded-lg px-3 py-1.5">
              <RewardIcon className="w-3.5 h-3.5 text-white" />
              <span className="text-[12px] font-semibold text-white">
                {rewardText}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-white/80">
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

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Scroll, CheckCircle2, Clock, Snowflake, Star, History } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuestData } from "@/types";

interface QuestCardProps {
  quest: QuestData | null;
  loading?: boolean;
  onHistoryOpen?: () => void;
  className?: string;
}

const QUEST_TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string; bgColor: string; borderColor: string }
> = {
  deep_study: {
    label: "Deep Study",
    icon: Scroll,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100/50",
  },
  reflection_done: {
    label: "Refleksi",
    icon: Star,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-100/50",
  },
  checklist_use: {
    label: "Checklist",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-100/50",
  },
};

export function QuestCard({ quest, loading, onHistoryOpen, className }: QuestCardProps) {
  if (loading) {
    return (
      <div className={cn(
        "relative overflow-hidden p-5 bg-white rounded-[24px] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] border border-neutral-100 animate-pulse",
        className
      )}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-neutral-200" />
          <div className="flex-1 space-y-2">
            <div className="w-32 h-4 rounded bg-neutral-200" />
            <div className="w-full h-2 rounded-full bg-neutral-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!quest) {
    return (
      <div className={cn(
        "relative overflow-hidden p-5 bg-white rounded-[24px] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] border border-neutral-100",
        className
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-neutral-100 flex items-center justify-center border border-neutral-200/50 shrink-0">
              <Scroll className="w-5 h-5 text-neutral-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                Belum ada quest aktif
              </h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Quest baru akan muncul secara berkala
              </p>
            </div>
          </div>
          {onHistoryOpen && (
            <button
              onClick={onHistoryOpen}
              className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              Riwayat
            </button>
          )}
        </div>
      </div>
    );
  }

  const config = QUEST_TYPE_CONFIG[quest.type || ""] || QUEST_TYPE_CONFIG.deep_study;
  const Icon = config.icon;
  const progress = quest.progress ?? 0;
  const target = quest.target ?? 1;
  const percent = target > 0 ? Math.min((progress / target) * 100, 100) : 0;
  const isCompleted = quest.status === "completed";
  const isExpired = quest.status === "expired";

  const rewardLabel =
    quest.reward?.type === "freeze" ? (
      <span className="flex items-center gap-1 text-[11px] font-semibold text-sky-600">
        <Snowflake className="w-3 h-3" />
        Streak Freeze +{quest.reward.value || 1}
      </span>
    ) : quest.reward?.type === "quest_item" ? (
      <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600">
        <Star className="w-3 h-3" />
        Item Eksklusif
      </span>
    ) : null;

  const timeLeft = isCompleted
    ? "Selesai!"
    : isExpired
    ? "Waktu habis"
    : formatTimeLeft(quest.end_date);

  return (
    <div
      className={cn(
        "relative overflow-hidden p-5 bg-white rounded-[24px] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] border border-neutral-100",
        isCompleted && "bg-emerald-50/30 border-emerald-100",
        isExpired && "opacity-60",
        className
      )}
    >
      <div
        className={cn(
          "absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-3xl",
          isCompleted ? "bg-emerald-500/10" : "bg-primary/5"
        )}
      />

      <div className="relative z-10 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center border shrink-0",
                config.bgColor,
                config.borderColor,
                isCompleted && "bg-emerald-50 border-emerald-100/50"
              )}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <Icon className={cn("w-5 h-5", config.color)} />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 tracking-tight leading-tight">
                {quest.title || config.label}
              </h3>
              {quest.description && (
                <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">
                  {quest.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onHistoryOpen && (
              <button
                onClick={onHistoryOpen}
                className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                <History className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="flex items-center gap-1 text-[11px] text-neutral-400">
              <Clock className="w-3 h-3" />
              {timeLeft}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              Progres
            </span>
            <span
              className={cn(
                "text-xs font-black",
                isCompleted ? "text-emerald-600" : "text-neutral-900"
              )}
            >
              {progress}/{target}
            </span>
          </div>
          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full",
                isCompleted
                  ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                  : "bg-gradient-to-r from-primary to-primary/80"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {rewardLabel && (
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-neutral-400">Hadiah</span>
            {rewardLabel}
          </div>
        )}
      </div>
    </div>
  );
}

function formatTimeLeft(endDate?: string | null): string {
  if (!endDate) return "";
  const end = new Date(endDate);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();

  if (diffMs <= 0) return "Waktu habis";

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}h lagi`;
  if (diffHours > 0) return `${diffHours}j lagi`;
  const diffMin = Math.floor(diffMs / (1000 * 60));
  return `${diffMin}m lagi`;
}

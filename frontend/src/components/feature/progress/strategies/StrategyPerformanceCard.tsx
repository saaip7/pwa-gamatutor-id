"use client";

import React from "react";
import { LucideIcon, TrendingUp, BarChart2, Sparkles, CheckCircle2, Target, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface StrategyPerformanceData {
  id: string;
  name: string;
  category: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  isTop?: boolean;
  isUnused?: boolean;
  subjective?: {
    rating: number;
    total_tasks: number;
    positive_percent: number;
    emoji: string;
  };
  completion?: {
    done_count: number;
    completion_rate: number;
  };
  objective?: {
    improvement: number;
    total_tasks: number;
    is_data_insufficient?: boolean;
  };
}

interface StrategyPerformanceCardProps {
  data: StrategyPerformanceData;
  index: number;
}

export function StrategyPerformanceCard({ data, index }: StrategyPerformanceCardProps) {
  if (data.isUnused) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border-2 border-dashed border-neutral-200 bg-white/60 p-5 opacity-70 relative overflow-hidden"
      >
        <div className="flex items-center gap-3.5 mb-2">
          <div className="w-[52px] h-[52px] rounded-[14px] bg-neutral-100 text-neutral-400 flex items-center justify-center shrink-0 border border-neutral-200">
            <data.icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-neutral-600 text-base">{data.name}</h3>
            <p className="text-sm text-neutral-400 font-medium mt-0.5">{data.category}</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-6 px-4 text-center mt-2">
          <div className="w-12 h-12 bg-neutral-100/80 rounded-full flex items-center justify-center mb-3">
            <BarChart2 className="w-5 h-5 text-neutral-400" />
          </div>
          <p className="text-base font-bold text-neutral-700 mb-1.5">Belum ada data</p>
          <p className="text-sm text-neutral-500 leading-relaxed max-w-[240px]">
            Strategi ini belum pernah digunakan. Coba strategi ini di tugas berikutnya! <Sparkles className="inline w-3.5 h-3.5 text-amber-400" />
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3.5">
          <div className={cn(
            "w-[52px] h-[52px] rounded-[14px] flex items-center justify-center shrink-0 border",
            data.iconBg,
            data.iconColor
          )}>
            <data.icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-neutral-900 text-base">{data.name}</h3>
            <p className="text-sm text-neutral-500 font-medium mt-0.5">{data.category}</p>
          </div>
        </div>
        {data.isTop && (
          <div className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-emerald-100 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Top
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="space-y-3">
        {/* Row 1: Rating Kamu */}
        {data.subjective && data.subjective.total_tasks > 0 && (
          <div className="bg-neutral-50/80 rounded-xl p-3.5 border border-neutral-100/80">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-3.5 h-3.5 text-purple-500" />
              <p className="text-xs text-neutral-500 font-medium">
                Rating Kamu <span className="text-neutral-400">(Berdasarkan {data.subjective.total_tasks} tugas)</span>
              </p>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-black text-neutral-900 flex items-center gap-1">
                {data.subjective.emoji} {data.subjective.rating}
                <span className="text-[10px] text-neutral-400 font-bold">/5</span>
              </span>
              <span className="text-[10px] font-semibold text-neutral-400">
                {data.subjective.positive_percent}% positif
              </span>
            </div>
            <div className="w-full bg-neutral-200/80 h-[6px] rounded-full overflow-hidden">
              <motion.div
                className="bg-purple-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${data.subjective.positive_percent}%` }}
                transition={{ duration: 1, delay: 0.3 + (index * 0.1) }}
              />
            </div>
          </div>
        )}

        {/* Row 2: Tingkat Penyelesaian */}
        {data.completion && data.completion.done_count > 0 && (
          <div className="bg-emerald-50/40 rounded-xl p-3.5 border border-emerald-100/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <p className="text-xs text-neutral-500 font-medium">
                  Tingkat Penyelesaian <span className="text-neutral-400">({data.completion.done_count} tugas)</span>
                </p>
              </div>
              <span className="text-sm font-black text-neutral-900">{data.completion.completion_rate}%</span>
            </div>
            <div className="w-full bg-neutral-200/80 h-[6px] rounded-full overflow-hidden">
              <motion.div
                className="bg-emerald-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${data.completion.completion_rate}%` }}
                transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
              />
            </div>
          </div>
        )}

        {/* Row 3: Peningkatan Nilai */}
        {data.objective && !data.objective.is_data_insufficient ? (
          <div className="bg-blue-50/40 rounded-xl p-3.5 border border-blue-100/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-blue-500" />
                <p className="text-xs text-neutral-500 font-medium">
                  Peningkatan Nilai <span className="text-neutral-400">({data.objective.total_tasks} tugas)</span>
                </p>
              </div>
              <span className="text-sm font-black text-neutral-900">+{data.objective.improvement}%</span>
            </div>
            <div className="w-full bg-neutral-200/80 h-[6px] rounded-full overflow-hidden">
              <motion.div
                className="bg-blue-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(data.objective.improvement, 100)}%` }}
                transition={{ duration: 1, delay: 0.7 + (index * 0.1) }}
              />
            </div>
            <p className="text-[10px] font-semibold text-neutral-400 text-right mt-1">
              {data.objective.improvement > 20 ? "Sangat signifikan" : data.objective.improvement > 0 ? "Stabil naik" : "Perlu evaluasi"}
            </p>
          </div>
        ) : (
          <div className="bg-amber-50/40 rounded-xl p-3.5 border border-amber-100/40">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-100/80 text-amber-500 flex items-center justify-center shrink-0">
                <Target className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-amber-800">Data Belum Cukup</p>
                <p className="text-[11px] text-amber-700/70 font-medium mt-0.5 leading-snug">
                  Mulai tracking nilai pre-test &amp; post-test di tugas untuk melihat peningkatan.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Fallback: no data at all */}
        {(!data.subjective || data.subjective.total_tasks === 0) && (!data.completion || data.completion.done_count === 0) && (
          <div className="text-center py-4">
            <p className="text-xs text-neutral-400">Belum ada data refleksi</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

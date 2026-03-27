"use client";

import React from "react";
import { LucideIcon, TrendingUp, AlertTriangle, BarChart2, Sparkles } from "lucide-react";
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
    rating: number; // e.g., 4.8
    totalTasks: number;
    positivePercent: number;
    emoji: string;
  };
  objective?: {
    improvement: number; // e.g., 40
    totalTasks: number;
    isDataInsufficient?: boolean;
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
        className="rounded-[24px] border-2 border-dashed border-neutral-200 bg-white/60 p-5 opacity-70 relative overflow-hidden"
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
      className="bg-white rounded-[24px] border border-neutral-100 shadow-sm p-5"
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

      {/* Dual-Data Panels */}
      <div className="space-y-3">
        {/* Subjective Panel */}
        {data.subjective && (
          <div className="bg-neutral-50/80 rounded-[16px] p-4 border border-neutral-100/80">
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs text-neutral-500 font-medium">
                Rating Kamu <span className="text-neutral-400">(Berdasarkan {data.subjective.totalTasks} tugas)</span>
              </p>
              <span className="text-base font-black text-neutral-900 flex items-center gap-1">
                {data.subjective.emoji} {data.subjective.rating}
                <span className="text-xs text-neutral-400 font-bold">/5</span>
              </span>
            </div>
            <div className="w-full bg-neutral-200/80 h-2 rounded-full overflow-hidden mb-1.5">
              <motion.div 
                className="bg-purple-500 h-full rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: `${data.subjective.positivePercent}%` }}
                transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
              />
            </div>
            <p className="text-[11px] font-bold text-neutral-500 text-right">
              {data.subjective.positivePercent}% rating positif
            </p>
          </div>
        )}

        {/* Objective Panel */}
        {data.objective && (
          <div className={cn(
            "rounded-[16px] p-4 border",
            data.objective.isDataInsufficient 
              ? "bg-amber-50/40 border-amber-100/60" 
              : "bg-blue-50/50 border-blue-100/50"
          )}>
            <p className="text-xs text-neutral-500 font-medium mb-3">
              Peningkatan Nilai <span className="text-neutral-400">(Berdasarkan {data.objective.totalTasks} tugas)</span>
            </p>
            
            {data.objective.isDataInsufficient ? (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100/80 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-amber-800">Data Kurang</span>
                  <p className="text-xs text-amber-700/80 font-medium mt-0.5 leading-snug">
                    Aktifkan tracking nilai pada tugas untuk melihat insight objektif.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm border border-emerald-200/50">
                  <TrendingUp className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="flex items-end gap-1.5 mb-0.5">
                    <span className="text-xl font-black text-neutral-900 leading-none">
                      +{data.objective.improvement}%
                    </span>
                  </div>
                  <p className="text-xs text-emerald-600 font-bold">
                    Peningkatan {data.objective.improvement > 20 ? 'signifikan' : 'stabil'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

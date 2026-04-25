"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Trophy } from "lucide-react";

export interface SummaryData {
  total_cards: number;
  completed_cards: number;
  completion_rate: number; // percentage
  personal_best: string;
}

interface ProgressSummaryProps {
  data: SummaryData;
}

export function ProgressSummary({ data }: ProgressSummaryProps) {
  return (
    <motion.div 
      className="bg-white border border-neutral-200 rounded-xl p-4 mt-4 shadow-sm"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <h3 className="text-sm font-bold text-neutral-800 mb-4">Ringkasan Progres</h3>
      <div className="flex flex-wrap gap-4">
        {/* Total Cards */}
        <div className="flex-1 min-w-[120px]">
          <span className="text-xs font-medium text-neutral-500">Total Tugas</span>
          <span className="block text-xl font-bold text-neutral-800 mt-1">{data.total_cards}</span>
        </div>
        {/* Completed Cards */}
        <div className="flex-1 min-w-[120px]">
          <span className="text-xs font-medium text-neutral-500">Tugas Selesai</span>
          <span className="block text-xl font-bold text-neutral-800 mt-1">{data.completed_cards}</span>
        </div>
        {/* Completion Rate */}
        <div className="flex-1 min-w-[120px]">
          <span className="text-xs font-medium text-neutral-500">Tingkat Penyelesaian</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xl font-bold text-neutral-800">{data.completion_rate}%</span>
            <TrendingUp className="text-success w-4 h-4" />
          </div>
        </div>
        {/* Personal Best */}
        <div className="flex-1 min-w-[120px]">
          <span className="text-xs font-medium text-neutral-500">Rekor Pribadi</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xl font-bold text-neutral-800">{data.personal_best}</span>
            <Trophy className="text-warning w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

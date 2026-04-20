"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface StrategyItem {
  id: string;
  name: string;
  emoji: string;
  score: number; // out of 5
  taskCount: number;
}

interface LearningStrategiesProps {
  strategies: StrategyItem[];
}

export function LearningStrategies({ strategies }: LearningStrategiesProps) {
  return (
    <motion.div 
      className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm mt-4 mb-4 w-full"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-sm font-bold text-neutral-800">Strategi Belajar</h3>
        {strategies.length > 0 ? (
          <Link
            href="/progress/strategies"
            className="text-[11px] font-bold text-primary flex items-center gap-1 hover:text-primary-hover transition-colors"
          >
            Lihat detail
            <ArrowRight className="w-3 h-3" />
          </Link>
        ) : (
          <span className="text-[11px] font-bold text-neutral-300 flex items-center gap-1 cursor-not-allowed">
            Lihat detail
            <ArrowRight className="w-3 h-3" />
          </span>
        )}
      </div>

      {strategies.length > 0 ? (
        <div className="space-y-4">
          {strategies.map((strategy, index) => {
            const progressWidth = (strategy.score / 5) * 100;
            // Determine opacity/shade based on index to replicate design
            const barClass = index === 0 ? "bg-primary" : index === 1 ? "bg-primary/80" : "bg-primary/60";

            return (
              <div key={strategy.id}>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-xs font-semibold text-neutral-700 truncate mr-1">
                    {strategy.name} {strategy.emoji}
                  </span>
                  <span className="text-xs font-bold text-neutral-800 shrink-0">
                    {strategy.score}<span className="text-[10px] text-neutral-400 font-normal">/5</span>
                  </span>
                </div>
                <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                  <div className={`${barClass} h-full rounded-full transition-all duration-1000 ease-out`} style={{ width: `${progressWidth}%` }}></div>
                </div>
                <div className="text-[10px] text-neutral-500 mt-1.5 text-right font-medium">
                  Digunakan di {strategy.taskCount} tugas
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-neutral-400 text-center py-4">Belum ada data strategi. Gunakan strategi belajar saat menyelesaikan tugas!</p>
      )}
    </motion.div>
  );
}

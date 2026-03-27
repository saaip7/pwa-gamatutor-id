"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trophy, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AchievementBannerProps {
  unlockedCount: number;
  totalCount: number;
  variant?: "dashboard" | "progress";
  className?: string;
}

export function AchievementBanner({ unlockedCount, totalCount, variant = "dashboard", className }: AchievementBannerProps) {
  const percent = (unlockedCount / totalCount) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative overflow-hidden p-5",
        variant === "dashboard" && "bg-white rounded-[24px] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] border border-neutral-100",
        variant === "progress" && "bg-white rounded-xl shadow-sm border border-neutral-200",
        className
      )}
    >
      <Link href="/mastery" className="block group">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />

        <div className="flex items-center gap-4 relative z-10">
          {/* Trophy Icon Area */}
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100/50 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                {unlockedCount} Pencapaian Tercapai
              </h3>
              <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                  style={{ width: `${percent}%`, transition: 'width 0.8s ease-out' }}
                />
              </div>
              <span className="text-[11px] font-black text-amber-600">
                {unlockedCount}/{totalCount}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

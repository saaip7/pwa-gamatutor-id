"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Period = "week" | "month" | "all";

interface PeriodSelectorProps {
  activePeriod: Period;
  onPeriodChange: (period: Period) => void;
}

export function PeriodSelector({ activePeriod, onPeriodChange }: PeriodSelectorProps) {
  const periods: { id: Period; label: string }[] = [
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "all", label: "All Time" },
  ];

  return (
    <motion.div 
      className="flex gap-2 overflow-x-auto no-scrollbar pb-2"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      {periods.map((period) => {
        const isActive = activePeriod === period.id;
        
        return (
          <button
            key={period.id}
            onClick={() => onPeriodChange(period.id)}
            className={cn(
              "px-5 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all active:scale-95",
              isActive
                ? "font-semibold bg-primary text-white shadow-[0_2px_10px_rgba(59,130,246,0.15)]"
                : "font-medium bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
            )}
          >
            {period.label}
          </button>
        );
      })}
    </motion.div>
  );
}

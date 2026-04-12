"use client";

import { useState, useEffect } from "react";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface FocusTimerProps {
  personalBest: string;
  startTime: number; // Date.now() timestamp — wall clock
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
}

export function FocusTimer({ personalBest, startTime }: FocusTimerProps) {
  const [elapsed, setElapsed] = useState(() => Date.now() - startTime);

  useEffect(() => {
    const update = () => setElapsed(Date.now() - startTime);
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Progress ring (one full cycle per hour)
  const totalSec = Math.floor(elapsed / 1000);
  const progress = (totalSec % 3600) / 3600;
  const circumference = 2 * Math.PI * 47;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <section className="flex flex-col items-center justify-center py-2">
      <div className="relative flex items-center justify-center w-[260px] h-[260px]">
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="47"
            fill="transparent"
            stroke="#F3F4F6"
            strokeWidth="2.5"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="47"
            fill="transparent"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </svg>

        <div className="text-[52px] font-black text-neutral-900 tracking-tighter tabular-nums leading-none z-10">
          {formatTime(elapsed)}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-50 border border-neutral-100 rounded-lg">
        <Trophy className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
          Personal Best: {personalBest}
        </span>
      </div>
    </section>
  );
}

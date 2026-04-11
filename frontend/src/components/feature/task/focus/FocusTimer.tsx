"use client";

import React, { useState, useEffect } from "react";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface FocusTimerProps {
  personalBest: string;
}

export function FocusTimer({ personalBest }: FocusTimerProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
  };

  // Progress ring (one full cycle per hour)
  const progress = (seconds % 3600) / 3600;
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
          {formatTime(seconds)}
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

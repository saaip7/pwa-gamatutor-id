"use client";

import React from "react";
import { Timer } from "lucide-react";
import { motion } from "framer-motion";

interface ReflectionSummaryProps {
  duration: string;
  subtasksCompleted: number;
  totalSubtasks: number;
}

export function ReflectionSummary({ duration, subtasksCompleted, totalSubtasks }: ReflectionSummaryProps) {
  return (
    <div className="shrink-0 px-6 pt-8 pb-5 text-center relative">
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mb-4 text-3xl"
      >
        ✨
      </motion.div>
      
      <motion.h2 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-black text-neutral-900 tracking-tight leading-tight"
      >
        Sesi Selesai!<br/>Kamu Luar Biasa
      </motion.h2>

      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 p-4 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-center gap-3 border border-emerald-100 shadow-sm"
      >
        <Timer className="w-5 h-5 text-emerald-600" />
        <div className="flex items-center gap-2.5 text-sm font-black tracking-wider">
          <span>{duration}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
          <span className="uppercase">{subtasksCompleted}/{totalSubtasks} Subtask</span>
        </div>
      </motion.div>
    </div>
  );
}

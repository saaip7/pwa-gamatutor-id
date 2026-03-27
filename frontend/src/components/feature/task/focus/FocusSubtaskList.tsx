"use client";

import React, { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

interface FocusSubtaskListProps {
  initialSubtasks: Subtask[];
}

export function FocusSubtaskList({ initialSubtasks }: FocusSubtaskListProps) {
  const [subtasks, setSubtasks] = useState(initialSubtasks);

  const toggleSubtask = (id: string) => {
    setSubtasks(prev => prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  const allDone = subtasks.every(s => s.completed);

  return (
    <section className="space-y-4">
      <h3 className="text-[11px] font-black text-neutral-400 tracking-widest uppercase px-1">
        Langkah-Langkah
      </h3>
      
      <div className="space-y-3">
        {subtasks.map((s) => (
          <button
            key={s.id}
            onClick={() => toggleSubtask(s.id)}
            className={cn(
              "w-full flex items-start gap-4 p-4 rounded-2xl border transition-all text-left group active:scale-[0.98]",
              s.completed 
                ? "bg-emerald-50 border-emerald-200 shadow-sm" 
                : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
            )}
          >
            <div className={cn(
              "mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300",
              s.completed 
                ? "bg-emerald-500 border-emerald-500 text-white" 
                : "bg-white border-neutral-300 group-hover:border-primary"
            )}>
              {s.completed && <Check className="w-3.5 h-3.5 stroke-[4]" />}
            </div>
            <span className={cn(
              "flex-1 text-base font-bold transition-all duration-300",
              s.completed ? "text-emerald-900/50 line-through" : "text-neutral-800"
            )}>
              {s.text}
            </span>
          </button>
        ))}

        <AnimatePresence>
          {allDone && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="mt-4 p-4 bg-emerald-100 border border-emerald-200 rounded-2xl text-emerald-700 text-sm font-black flex items-center justify-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Hebat! Semua langkah selesai ✨
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

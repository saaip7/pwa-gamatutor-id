"use client";

import React, { useState } from "react";
import { Check, Sparkles, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

interface FocusSubtaskListProps {
  initialSubtasks: Subtask[];
  onToggle: (id: string) => void;
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
}

export function FocusSubtaskList({ initialSubtasks, onToggle, onAdd, onRemove }: FocusSubtaskListProps) {
  const [newText, setNewText] = useState("");
  const [showInput, setShowInput] = useState(false);

  const subtasks = initialSubtasks;
  const allDone = subtasks.length > 0 && subtasks.every((s) => s.completed);

  const handleAdd = () => {
    if (!newText.trim()) return;
    onAdd(newText.trim());
    setNewText("");
    setShowInput(false);
  };

  return (
    <section className="space-y-4">
      <h3 className="text-[11px] font-black text-neutral-400 tracking-widest uppercase px-1">
        Langkah-Langkah
      </h3>

      <div className="space-y-3">
        <AnimatePresence>
          {subtasks.map((s) => (
            <motion.button
              key={s.id}
              layout
              onClick={() => onToggle(s.id)}
              className={cn(
                "w-full flex items-start gap-4 p-4 rounded-2xl border transition-all text-left group active:scale-[0.98]",
                s.completed
                  ? "bg-emerald-50 border-emerald-200 shadow-sm"
                  : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
              )}
            >
              <div
                className={cn(
                  "mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300",
                  s.completed
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "bg-white border-neutral-300 group-hover:border-primary"
                )}
              >
                {s.completed && <Check className="w-3.5 h-3.5 stroke-[4]" />}
              </div>
              <span
                className={cn(
                  "flex-1 text-base font-bold transition-all duration-300",
                  s.completed
                    ? "text-emerald-900/50 line-through"
                    : "text-neutral-800"
                )}
              >
                {s.text}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(s.id);
                }}
                className="shrink-0 w-7 h-7 flex items-center justify-center text-neutral-300 hover:text-error transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.button>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="mt-4 p-4 bg-emerald-100 border border-emerald-200 rounded-2xl text-emerald-700 text-sm font-black flex items-center justify-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Hebat! Semua langkah selesai
            </motion.div>
          )}
        </AnimatePresence>

        {showInput ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Langkah baru..."
              autoFocus
              className="flex-1 px-4 py-3 rounded-xl border border-neutral-200 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            />
            <button
              onClick={handleAdd}
              className="px-4 py-3 bg-primary text-white rounded-xl text-sm font-bold active:scale-95 transition-all"
            >
              OK
            </button>
          </motion.div>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="w-full py-3.5 rounded-2xl border-2 border-dashed border-neutral-200 text-sm font-bold text-neutral-500 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            Tambah Langkah
          </button>
        )}
      </div>
    </section>
  );
}

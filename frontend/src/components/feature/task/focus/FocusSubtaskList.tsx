"use client";

import React, { useState } from "react";
import { Check, Sparkles, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { BoardCard } from "@/types";

interface FocusSubtaskListProps {
  card: BoardCard;
  onToggle: (checklistId: string) => void;
  onAdd: (title: string) => void;
  onRemove: (checklistId: string) => void;
}

export function FocusSubtaskList({ card, onToggle, onAdd, onRemove }: FocusSubtaskListProps) {
  const [newTitle, setNewTitle] = useState("");
  const [showInput, setShowInput] = useState(false);

  const checklists = card.checklists ?? [];
  const completedCount = checklists.filter((c) => c.isCompleted).length;
  const allDone = checklists.length > 0 && completedCount === checklists.length;

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    onAdd(newTitle.trim());
    setNewTitle("");
    setShowInput(false);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[11px] font-black text-neutral-400 tracking-widest uppercase">
          Langkah-Langkah
        </h3>
        {checklists.length > 0 && (
          <span className="text-[11px] font-bold text-neutral-400">
            {completedCount}/{checklists.length}
          </span>
        )}
      </div>

      {checklists.length > 0 && (
        <div className="px-1 w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-emerald-500 rounded-full"
            initial={false}
            animate={{ width: `${checklists.length > 0 ? (completedCount / checklists.length) * 100 : 0}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {checklists.map((c) => (
            <motion.div
              key={c.id}
              layout
              role="button"
              tabIndex={0}
              onClick={() => onToggle(c.id)}
              onKeyDown={(e) => e.key === "Enter" && onToggle(c.id)}
              className={cn(
                "w-full flex items-start gap-4 p-4 rounded-2xl border transition-all text-left group active:scale-[0.98] cursor-pointer",
                c.isCompleted
                  ? "bg-emerald-50 border-emerald-200 shadow-sm"
                  : "bg-white border-neutral-200 hover:border-neutral-300 shadow-sm"
              )}
            >
              <div
                className={cn(
                  "mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300",
                  c.isCompleted
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "bg-white border-neutral-300 group-hover:border-primary"
                )}
              >
                {c.isCompleted && <Check className="w-3.5 h-3.5 stroke-[4]" />}
              </div>
              <span
                className={cn(
                  "flex-1 text-base font-bold transition-all duration-300",
                  c.isCompleted
                    ? "text-emerald-900/50 line-through"
                    : "text-neutral-800"
                )}
              >
                {c.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(c.id);
                }}
                className="shrink-0 w-7 h-7 flex items-center justify-center text-neutral-300 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
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
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
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

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings2, ChevronDown, BarChart2, Leaf, Flame, Mountain, LineChart, CheckSquare, Plus, X, GripVertical, Link as LinkIcon, Youtube, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdvancedOptions() {
  const [isOpen, setIsOpen] = useState(false);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [isTrackNilai, setTrackNilai] = useState(false);

  return (
    <div className="bg-white border-y border-neutral-100 -mx-5 px-5 py-6 mb-4">
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between group"
      >
        <div className="flex items-center gap-2">
          <Settings2 className="w-[18px] h-[18px] text-neutral-500" />
          <span className="text-[15px] font-semibold text-neutral-900">Opsi Lanjutan</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-neutral-400" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-7 space-y-8">
              
              {/* Tingkat Kesulitan */}
              <div className="space-y-3">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
                  <BarChart2 className="w-3.5 h-3.5" />
                  Tingkat Kesulitan
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "Easy", label: "Mudah", icon: Leaf, color: "text-emerald-500" },
                    { id: "Medium", label: "Sedang", icon: Flame, color: "text-amber-500" },
                    { id: "Hard", label: "Sulit", icon: Mountain, color: "text-error" },
                  ].map((diff) => {
                    const isSelected = difficulty === diff.id;
                    const DiffIcon = diff.icon;
                    return (
                      <button
                        key={diff.id}
                        type="button"
                        onClick={() => setDifficulty(diff.id as any)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 py-4 rounded-xl border transition-all relative",
                          isSelected
                            ? "border-2 border-amber-500 bg-amber-50"
                            : "border-neutral-200 bg-white"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-sm">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                        <DiffIcon className={cn("w-6 h-6", diff.color)} />
                        <span className={cn("text-[13px]", isSelected ? "font-semibold text-amber-700" : "font-medium text-neutral-600")}>
                          {diff.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tracking Evaluasi */}
              <div className="space-y-3">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
                  <LineChart className="w-3.5 h-3.5" />
                  Tracking Evaluasi
                </label>
                <div className="p-4 rounded-xl border border-neutral-200 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[14px] font-medium text-neutral-900">Track Nilai</p>
                      <p className="text-[12px] text-neutral-500 mt-0.5">Pantau progress pre/post test</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTrackNilai(!isTrackNilai)}
                      className={cn(
                        "w-11 h-6 rounded-full relative transition-colors focus:outline-none",
                        isTrackNilai ? "bg-primary" : "bg-neutral-200"
                      )}
                    >
                      <div className={cn(
                        "absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform",
                        isTrackNilai ? "translate-x-5" : "translate-x-0"
                      )}></div>
                    </button>
                  </div>
                  
                  {isTrackNilai && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 pt-4 border-t border-neutral-100"
                    >
                      <label className="text-[12px] font-medium text-neutral-600 mb-2 block">Nilai Pre-test (Opsional)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          placeholder="0" 
                          className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-[14px] transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 text-[14px] font-medium">%</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Subtasks Placeholder */}
              <div className="space-y-3">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
                  <CheckSquare className="w-3.5 h-3.5" />
                  Subtasks
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 pl-2 pr-3 py-2 rounded-xl border border-neutral-200 bg-white focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all group">
                    <button type="button" className="text-neutral-400 cursor-grab active:cursor-grabbing hover:text-neutral-600 transition-colors shrink-0">
                      <GripVertical className="w-5 h-5" />
                    </button>
                    <div className="w-5 h-5 rounded border border-neutral-300 flex items-center justify-center shrink-0"></div>
                    <input type="text" placeholder="Review materi bab 1" className="flex-1 text-[14px] py-1.5 outline-none text-neutral-900 bg-transparent min-w-0" />
                    <button type="button" className="text-neutral-400 hover:text-error transition-colors shrink-0">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <button type="button" className="w-full py-3.5 rounded-xl border border-dashed border-neutral-300 text-[14px] font-medium text-neutral-600 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    Tambah Subtask
                  </button>
                </div>
              </div>

              {/* Links Placeholder */}
              <div className="space-y-3">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
                  <LinkIcon className="w-3.5 h-3.5" />
                  Links
                </label>
                <div className="space-y-3 pb-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 bg-white">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-error shrink-0">
                      <Youtube className="w-5 h-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[14px] font-medium text-neutral-900 truncate">Tutorial Algoritma Dasar</p>
                      <p className="text-[12px] text-neutral-500 truncate mt-0.5">youtube.com/watch?v=123</p>
                    </div>
                    <button type="button" className="w-10 h-10 flex items-center justify-center rounded-full text-neutral-400 hover:text-error hover:bg-red-50 transition-colors shrink-0">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <button type="button" className="w-full py-3.5 rounded-xl border border-dashed border-neutral-300 text-[14px] font-medium text-neutral-600 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    Tambah Link
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

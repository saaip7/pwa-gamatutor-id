"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Timer, Star, ArrowRight } from "lucide-react";
import { ConfettiSystem } from "./ConfettiSystem";

interface CelebrationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  duration: string;
  confidence: string;
  mainGoal?: string;
  tasksCompleted?: number;
}

export function CelebrationDialog({ isOpen, onConfirm, duration, confidence, mainGoal, tasksCompleted = 0 }: CelebrationDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 pb-[calc(80px+env(safe-area-inset-bottom))] pt-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
            onClick={onConfirm}
          />

          <ConfettiSystem />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white w-full max-w-[340px] rounded-2xl shadow-2xl overflow-hidden z-[120]"
          >
            <div className="px-6 pt-6 pb-2 text-center">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.15 }}
                className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4"
              >
                <motion.div
                  animate={{ y: [0, -2, 1, 0], scale: [1, 1.05, 0.98, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <CheckCircle className="text-emerald-500 w-9 h-9" strokeWidth={2.5} />
                </motion.div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-lg font-bold text-neutral-900 tracking-tight"
              >
                Tugas Tuntas!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-sm text-neutral-400 mt-1"
              >
                {mainGoal
                  ? `${tasksCompleted + 1} tugas selesai menuju "${mainGoal}"`
                  : "Satu langkah lebih dekat ke tujuanmu"}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mx-5 my-3 flex items-center justify-center gap-5 bg-neutral-50 rounded-xl py-3 border border-neutral-100"
            >
              <div className="flex items-center gap-2">
                <Timer className="text-emerald-600 w-4 h-4" />
                <span className="text-sm font-semibold text-neutral-700">{duration}</span>
              </div>
              <div className="w-px h-4 bg-neutral-200" />
              <div className="flex items-center gap-2">
                <Star className="text-emerald-600 w-4 h-4 fill-emerald-600" />
                <span className="text-sm font-semibold text-neutral-700">{confidence}</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="px-5 pb-5 pt-2"
            >
              <button
                onClick={onConfirm}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.98]"
              >
                Kembali ke Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

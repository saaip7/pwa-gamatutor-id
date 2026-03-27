"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Timer, Star } from "lucide-react";
import { ConfettiSystem } from "./ConfettiSystem";

interface CelebrationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  duration: string;
  confidence: string;
}

export function CelebrationDialog({ isOpen, onConfirm, duration, confidence }: CelebrationDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md"
            onClick={onConfirm}
          />

          {/* Confetti System - High Z-index */}
          <ConfettiSystem />

          {/* Modal Card */}
          <motion.div 
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
            className="relative bg-white rounded-[40px] p-8 w-full max-w-[320px] text-center shadow-2xl z-[120] overflow-hidden"
          >
            {/* Hero Icon */}
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", delay: 0.3 }}
              className="w-[88px] h-[88px] rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]"
            >
              <motion.div
                animate={{ 
                  y: [0, -3, 2, 0],
                  scale: [1, 1.06, 0.98, 1],
                }}
                transition={{ 
                  duration: 3.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <CheckCircle className="text-emerald-500 w-14 h-14" strokeWidth={2.5} />
              </motion.div>
            </motion.div>

            {/* Title */}
            <h2 className="text-2xl font-black text-neutral-900 mb-5 leading-tight tracking-tight">
              Tugas Tuntas!<br/>Kerja Bagus ✨
            </h2>

            {/* Summary Row */}
            <div className="flex items-center justify-center gap-4 w-full bg-neutral-50 rounded-[20px] py-4 px-4 mb-6 border border-neutral-100/80">
              <div className="flex items-center gap-2">
                <Timer className="text-emerald-600 w-4.5 h-4.5" />
                <span className="text-sm font-bold text-neutral-700 mt-0.5">{duration}</span>
              </div>
              <div className="w-[1.5px] h-5 bg-neutral-200 rounded-full"></div>
              <div className="flex items-center gap-2">
                <Star className="text-emerald-600 w-4.5 h-4.5 fill-emerald-600" />
                <span className="text-sm font-bold text-neutral-700 mt-0.5">{confidence}</span>
              </div>
            </div>

            {/* Text */}
            <p className="text-sm text-neutral-500 font-medium leading-relaxed mb-8 px-1">
              Satu langkah lebih dekat ke tujuanmu. Teruslah belajar dengan otonom!
            </p>

            {/* Button */}
            <button 
              onClick={onConfirm}
              className="w-full h-[56px] bg-primary hover:bg-primary-hover text-white font-black text-base rounded-2xl transition-all active:scale-95 shadow-lg shadow-primary/20 animate-pulse-slow"
            >
              Kembali ke Dashboard
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

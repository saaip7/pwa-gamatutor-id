"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SnowfallParticles } from "@/components/shared/SnowfallParticles";

interface StreakFreezeCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUOTES = [
  "Istirahat adalah bagian dari proses belajar.",
  "Konsistensi bukan berarti tidak pernah berhenti.",
  "Satu hari jeda tidak menghapus usaha berbulan-bulan.",
];

export function StreakFreezeCelebration({ isOpen, onClose }: StreakFreezeCelebrationProps) {
  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[60] flex items-center justify-center"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-neutral-950" />

          {/* Particles */}
          <SnowfallParticles />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center px-8 text-center max-w-sm">
            {/* Snowflake Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1], type: "spring", stiffness: 120 }}
              className="relative w-[200px] h-[200px] flex items-center justify-center mb-8"
            >
              {/* Ambient glow */}
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-[80px] opacity-30 animate-pulse-glow" />

              {/* SVG Snowflake */}
              <img
                src="/assets/snow_remixed2.svg"
                alt="Streak Freeze Badge"
                className="relative z-10 w-[200px] h-[200px] object-contain animate-float"
              />
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="text-2xl font-bold text-white tracking-tight mb-2"
            >
              Streak Freeze Aktif!
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="text-base text-white/60 leading-relaxed mb-12 px-2"
            >
              Streak kamu aman. Nikmati waktu istirahatmu hari ini.
            </motion.p>

            {/* Quote */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-sm text-white/40 italic leading-relaxed mb-14 px-4"
            >
              &ldquo;{quote}&rdquo;
            </motion.p>

            {/* Button */}
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/15 active:bg-white/20 text-white text-sm font-semibold rounded-2xl border border-white/10 backdrop-blur-sm transition-all active:scale-[0.98]"
            >
              Kembali ke Beranda
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

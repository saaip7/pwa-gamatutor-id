"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SnowfallParticles } from "@/components/shared/SnowfallParticles";
import { CharacterItemGrid } from "./CharacterItemGrid";
import { MasteryBadgeIcon, type BadgeShape } from "./MasteryBadgeIcon";

interface BadgeCelebrationData {
  name: string;
  subtitle: string;
  icon: LucideIcon;
  shape: BadgeShape;
}

interface BadgeUnlockedCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  data: BadgeCelebrationData | null;
}

export type { BadgeCelebrationData };

export function BadgeUnlockedCelebration({ isOpen, onClose, data }: BadgeUnlockedCelebrationProps) {
  if (!data) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-[#0A0D14]" />

          {/* Amber Particles */}
          <SnowfallParticles colorTheme="amber" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center px-8 text-center max-w-sm w-full">

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl font-bold text-white tracking-tight mb-2"
            >
              {data.name}
              <span className="text-amber-400 ml-1.5">Terbuka!</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="text-sm text-gray-400 leading-relaxed mb-8"
            >
              {data.subtitle}
            </motion.p>

            {/* Floating Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1], type: "spring", stiffness: 120 }}
              className="relative mb-8"
            >
              {/* Glow */}
              <div className="absolute inset-0 bg-amber-500 rounded-full blur-[80px] opacity-30 animate-pulse" />

              {/* Badge container */}
              <div className="relative w-[160px] h-[160px] rounded-full bg-white/5 border border-amber-400/30 flex items-center justify-center animate-float drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                <MasteryBadgeIcon
                  shape={data.shape}
                  icon={data.icon}
                  iconClassName="[&>svg]:w-[52px] [&>svg]:h-[52px]"
                />
              </div>

              {/* Sparkle: top-right */}
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-5 h-5 text-amber-300 animate-ping" style={{ animationDuration: "2s" }} />
              </div>

              {/* Sparkle: bottom-left */}
              <div className="absolute -bottom-1 -left-3">
                <Sparkles className="w-4 h-4 text-amber-200 animate-ping" style={{ animationDelay: "0.7s", animationDuration: "2.5s" }} />
              </div>

              {/* Star: top-left */}
              <div className="absolute -top-1 -left-4">
                <Star className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
              </div>

              {/* Bouncing dot: right */}
              <div className="absolute top-1/2 -right-5 -translate-y-1/2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
              </div>

              {/* Bouncing dot: bottom-right */}
              <div className="absolute -bottom-3 right-4">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-bounce" style={{ animationDelay: "0.5s" }} />
              </div>
            </motion.div>

            {/* Character Item Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mb-8"
            >
              <CharacterItemGrid unlocked />
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 w-full max-w-xs"
            >
              <button
                onClick={onClose}
                className="flex-1 py-4 rounded-xl font-bold text-white bg-gray-900/80 border border-gray-600 backdrop-blur-sm transition-all active:scale-[0.98]"
              >
                Pasang ke Karakter
              </button>
              <button
                onClick={onClose}
                className="w-[60px] shrink-0 rounded-xl bg-blue-600 flex items-center justify-center text-white transition-all active:scale-[0.98] self-stretch"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

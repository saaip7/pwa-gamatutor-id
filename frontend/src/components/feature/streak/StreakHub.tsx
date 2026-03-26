"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flame } from "lucide-react";
import { StreakCalendar, StreakDay } from "./StreakCalendar";
import { StreakFreezeCard } from "./StreakFreezeCard";

export interface StreakData {
  current: number;
  longest: number;
  days: StreakDay[];
  freezesAvailable: number;
}

interface StreakHubProps {
  isOpen: boolean;
  onClose: () => void;
  data: StreakData;
  onUseFreeze?: () => void;
}

export function StreakHub({ isOpen, onClose, data, onUseFreeze }: StreakHubProps) {
  const handleUseFreeze = () => {
    // TODO: Call API to use streak freeze
    console.log("Streak freeze used");
    onUseFreeze?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 top-0 bottom-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden relative shadow-2xl max-h-[90dvh] flex flex-col">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-neutral-50 hover:bg-neutral-100 active:bg-neutral-200 rounded-full text-neutral-500 transition-colors shrink-0 z-30"
              >
                <X className="w-[22px] h-[22px]" />
              </button>

              {/* Scrollable Content */}
              <div className="flex-1 flex flex-col justify-center px-6 py-10 overflow-y-auto">
                {/* Hero Section */}
                <div className="text-center mb-12">
                  <div className="relative inline-flex flex-col items-center justify-center mb-6">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      {/* Glow */}
                      <div className="absolute inset-0 bg-amber-400 rounded-full blur-[28px] opacity-30 animate-pulse-glow" />
                      {/* Flame */}
                      <Flame className="text-amber-500 w-[100px] h-[100px] drop-shadow-xl relative z-10 animate-flame" />
                    </div>
                    {/* Streak Number Pill */}
                    <div className="bg-white px-6 py-2 rounded-full border border-amber-100 shadow-[0_4px_16px_rgba(245,158,11,0.15)] relative z-20 -mt-6 flex items-center gap-1.5">
                      <span className="text-[26px] font-extrabold text-amber-600 leading-none tracking-tight">{data.current}</span>
                      <span className="text-[14px] font-bold text-amber-600/80 uppercase tracking-widest leading-none mt-0.5">Hari</span>
                    </div>
                  </div>

                  <h2 className="text-[24px] font-bold text-neutral-900 mb-2.5 tracking-tight">Konsistensi Kamu</h2>
                  <p className="text-[15px] text-neutral-500 px-4 leading-relaxed">
                    {data.current === 0
                      ? "Yuk mulai belajar hari ini!"
                      : `Luar biasa! Kamu telah aktif belajar selama ${data.current} hari berturut-turut.`
                    }
                  </p>
                </div>

                {/* Mini Calendar */}
                <div className="mb-12">
                  <StreakCalendar days={data.days} />
                </div>

                {/* Streak Freeze */}
                <div>
                  <StreakFreezeCard
                    available={data.freezesAvailable}
                    onUse={handleUseFreeze}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

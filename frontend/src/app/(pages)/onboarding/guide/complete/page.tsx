"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { LayoutGrid, Timer, BarChart3, BookOpenCheck, Palette } from "lucide-react";
import { useTourStore } from "@/stores/tour";
import { usePreferencesStore } from "@/stores/preferences";
import { useBadgesStore } from "@/stores/badges";

const CONFETTI_COLORS = ["#3B82F6", "#10b981", "#f59e0b", "#8CD2FF", "#a78bfa"];

const RECAP_ITEMS = [
  { icon: LayoutGrid, label: "Kanban Board", color: "text-blue-500" },
  { icon: Timer, label: "Focus Mode", color: "text-teal-500" },
  { icon: BookOpenCheck, label: "Refleksi", color: "text-violet-500" },
  { icon: BarChart3, label: "Progress", color: "text-indigo-500" },
  { icon: Palette, label: "Karakter", color: "text-amber-500" },
];

export default function GuideCompletePage() {
  const router = useRouter();
  const markTourCompleted = useTourStore((s) => s.markTourCompleted);
  const preferences = usePreferencesStore((s) => s.preferences);
  const updateOnboarding = usePreferencesStore((s) => s.updateOnboarding);
  const fetchBadges = useBadgesStore((s) => s.fetchBadges);
  const completed = useRef(false);

  useEffect(() => {
    ["tour-1", "tour-2", "tour-3", "tour-4", "tour-5"].forEach((id) => markTourCompleted(id));
  }, [markTourCompleted]);

  useEffect(() => {
    if (completed.current) return;
    const isOnboardingDone = preferences?.onboarding?.completed;
    if (isOnboardingDone === undefined) return;
    if (!isOnboardingDone) {
      completed.current = true;
      updateOnboarding({ completed: true })
        .then(() => fetchBadges())
        .catch(() => {});
    }
  }, [preferences, updateOnboarding, fetchBadges]);

  return (
    <div className="w-full h-screen bg-white flex flex-col font-sans text-neutral-800 relative overflow-hidden max-w-md mx-auto">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-15%] w-80 h-80 bg-primary/4 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-15%] w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-[25%] right-[-5%] w-48 h-48 bg-amber-100/20 rounded-full blur-3xl" />

        {Array.from({ length: 18 }).map((_, i) => {
          const left = `${(i * 17 + 5) % 100}%`;
          const delay = (i * 0.3) % 4;
          const duration = 5 + (i % 3) * 2;
          const size = 4 + (i % 3) * 2;
          const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
          const isCircle = i % 3 === 0;

          return (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left,
                top: "-5%",
                width: size,
                height: isCircle ? size : size * 2.5,
                backgroundColor: color,
                borderRadius: isCircle ? "50%" : "2px",
                opacity: 0.6,
              }}
              animate={{
                y: ["0vh", "110vh"],
                rotate: [0, 360 * (i % 2 === 0 ? 1 : -1)],
                x: [0, (i % 2 === 0 ? 1 : -1) * 20],
              }}
              transition={{
                duration,
                delay,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          );
        })}

        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute animate-twinkle"
            style={{
              left: `${10 + (i * 23) % 80}%`,
              top: `${5 + (i * 19) % 60}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${2 + (i % 3)}s`,
            }}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M4 0L4.8 3.2L8 4L4.8 4.8L4 8L3.2 4.8L0 4L3.2 3.2L4 0Z" fill="#3B82F6" fillOpacity="0.3" />
            </svg>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 z-10 relative">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 150, damping: 12 }}
          className="relative mb-6"
        >
          <div className="absolute -inset-10 bg-gradient-to-b from-primary/8 to-transparent rounded-full blur-2xl" />

          <motion.div
            className="relative animate-pulse-scale"
            style={{ width: 96, height: 96 }}
          >
            <Image
              src="/logo-only.svg"
              alt="Gamatutor"
              width={96}
              height={96}
              className="w-full h-full drop-shadow-2xl"
              priority
            />
          </motion.div>

          {/* Orbiting rings */}
          <motion.div
            className="absolute inset-0 -m-8 pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary/20" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-400/30" />
          </motion.div>
          <motion.div
            className="absolute inset-0 -m-12 pointer-events-none"
            animate={{ rotate: -360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400/25" />
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary/15" />
          </motion.div>
        </motion.div>

        {/* Badge stamp */}
        <motion.div
          initial={{ opacity: 0, scale: 0, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: 0.4, type: "spring", stiffness: 200 }}
          className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-amber-100/80 border border-amber-200/50 rounded-full px-3 py-1 mb-4"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span className="text-[11px] font-bold text-amber-700 tracking-wide">Tur Selesai</span>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center"
        >
          <h1 className="text-[22px] font-extrabold text-neutral-900 tracking-tight leading-tight">
            Selamat, kamu siap <br />memulai perjalanan!
          </h1>
          <p className="text-[13px] text-neutral-400 mt-2.5 leading-relaxed max-w-[260px] mx-auto font-medium">
            Kelola tugas, pantau progres, dan raih milestone belajarmu satu per satu.
          </p>
        </motion.div>

        {/* Recap chips */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-6 flex flex-wrap justify-center gap-2 max-w-[320px]"
        >
          {RECAP_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.8 + i * 0.06 }}
                className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-neutral-100 rounded-full px-3 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
              >
                <Icon className={`w-3.5 h-3.5 ${item.color}`} strokeWidth={2.2} />
                <span className="text-[11px] font-semibold text-neutral-600">{item.label}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.0 }}
        className="px-6 pb-10 pt-4 z-10 relative"
      >
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-primary-hover active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(59,130,246,0.35)]"
        >
          Mulai Belajar
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
        <p className="text-center text-[11px] text-neutral-300 mt-3 font-medium">
          Kamu bisa mengulangi tur kapan saja dari Pengaturan
        </p>
      </motion.div>
    </div>
  );
}

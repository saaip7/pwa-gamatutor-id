"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { Map, ArrowRight, LayoutGrid, Timer, BarChart3, Trophy } from "lucide-react";
import { usePreferencesStore } from "@/stores/preferences";
import { useBadgesStore } from "@/stores/badges";
import { toast } from "sonner";

const TOUR_STEPS = [
  { num: 1, label: "Mengenal Kanban Board", desc: "Kelola tugas dengan board", icon: LayoutGrid, accent: "bg-blue-500", text: "text-blue-600" },
  { num: 2, label: "Focus Mode", desc: "Belajar dengan timer fokus", icon: Timer, accent: "bg-teal-500", text: "text-teal-600" },
  { num: 3, label: "Refleksi", desc: "Evaluasi proses belajar", icon: BarChart3, accent: "bg-violet-500", text: "text-violet-600" },
  { num: 4, label: "Progress", desc: "Pantau perkembanganmu", icon: BarChart3, accent: "bg-indigo-500", text: "text-indigo-600" },
  { num: 5, label: "Badges & Karakter", desc: "Kumpulkan badge, kostumisasi", icon: Trophy, accent: "bg-amber-500", text: "text-amber-600" },
];

const containerVariants: Variants = {
  hidden: {},
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.3 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export default function GuideIntroPage() {
  const router = useRouter();
  const updateOnboarding = usePreferencesStore((s) => s.updateOnboarding);
  const fetchBadges = useBadgesStore((s) => s.fetchBadges);
  const [isSkipping, setIsSkipping] = useState(false);
  const skipDone = useRef(false);

  return (
    <div className="w-full h-screen bg-white flex flex-col mx-auto overflow-hidden relative max-w-md">
      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-blue-400 via-primary to-blue-400 z-50" />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
        {/* Header area */}
        <div className="relative pt-12 pb-6 px-6 flex flex-col items-center">
          {/* Subtle radial bg */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(59,130,246,0.04)_0%,transparent_70%)]" />

          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-10 mb-6"
          >
            <div className="w-20 h-20 rounded-2xl bg-primary/8 border border-primary/10 flex items-center justify-center">
              <Map className="w-9 h-9 text-primary" strokeWidth={1.5} />
            </div>
            {/* Decorative dots */}
            <div className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 rounded-full bg-blue-400/30" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-primary/15" />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15, ease: "easeOut" }}
            className="text-center relative z-10"
          >
            <h1 className="text-[22px] font-extrabold text-neutral-900 tracking-tight leading-tight">
              Kenali Fitur Gamatutor
            </h1>
            <p className="text-[13px] text-neutral-400 mt-2 leading-relaxed max-w-[260px] mx-auto">
              Panduan singkat 5 langkah, atau langsung mulai belajar.
            </p>
          </motion.div>
        </div>

        {/* Steps list */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="px-5 pb-4 space-y-2.5"
        >
          {TOUR_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                variants={itemVariants}
                className="relative flex items-center gap-3.5 bg-neutral-50/80 border border-neutral-100 rounded-2xl px-4 py-3.5"
              >
                {/* Number badge */}
                <div className="relative shrink-0">
                  <div className={`w-9 h-9 rounded-xl ${step.accent}/10 flex items-center justify-center`}>
                    <Icon className={`w-[18px] h-[18px] ${step.text}`} strokeWidth={1.8} />
                  </div>
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${step.accent} text-white text-[9px] font-bold flex items-center justify-center`}>
                    {step.num}
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-neutral-800 leading-snug">{step.label}</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">{step.desc}</p>
                </div>

                {/* Connector line */}
                {i < TOUR_STEPS.length - 1 && (
                  <div className="absolute -bottom-[9px] left-[22px] w-px h-[9px] bg-neutral-200" />
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* CTA Footer */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.7, ease: "easeOut" }}
        className="shrink-0 px-5 pt-3 pb-8 bg-white border-t border-neutral-100/80"
      >
        <button
          onClick={() => router.push("/onboarding/guide/step-1")}
          className="w-full py-3.5 bg-primary text-white rounded-2xl font-bold text-[14px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-[0_2px_12px_rgba(59,130,246,0.25)]"
        >
          Mulai Panduan
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </button>
        <button
          onClick={async () => {
            if (skipDone.current || isSkipping) return;
            skipDone.current = true;
            setIsSkipping(true);
            try {
              await updateOnboarding({ completed: true, skipped_tour: true });
              await fetchBadges();
              await usePreferencesStore.getState().fetchPreferences();
              router.push("/dashboard");
            } catch {
              skipDone.current = false;
              setIsSkipping(false);
              toast.error("Gagal menyimpan progres, coba lagi");
            }
          }}
          disabled={isSkipping}
          className="w-full py-3 mt-2 text-neutral-400 font-semibold text-[13px] flex items-center justify-center gap-1.5 hover:text-neutral-600 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isSkipping ? (
            <div className="w-3.5 h-3.5 border-2 border-neutral-300 border-t-transparent rounded-full animate-spin" />
          ) : (
            "Lewati, langsung belajar"
          )}
        </button>
      </motion.div>
    </div>
  );
}

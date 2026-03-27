"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { MousePointer2, LayoutGrid, Target, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Step3FeatureIntroProps {
  onComplete: () => void;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

export function Step3FeatureIntro({ onComplete }: Step3FeatureIntroProps) {
  return (
    <>
      <div className="flex-1 flex flex-col justify-start text-left max-w-sm mx-auto w-full pt-4 pb-32">
        {/* Kanban Board Illustration */}
        <motion.div
          className="w-full aspect-[2/1] bg-neutral-50/80 rounded-2xl border border-neutral-100 p-3 flex gap-2 overflow-hidden shadow-sm relative mb-8"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          {/* Col 1: Todo */}
          <div className="flex-1 h-full bg-white rounded-lg border border-neutral-100 p-1.5 flex flex-col gap-1.5 shadow-sm">
            <div className="w-1/2 h-1.5 bg-neutral-200 rounded-full mb-1"></div>
            <div className="w-full h-6 bg-neutral-50 rounded border border-neutral-100"></div>
            <div className="w-full h-8 bg-neutral-50 rounded border border-neutral-100"></div>
          </div>
          {/* Col 2: In Progress */}
          <div className="flex-1 h-full bg-white rounded-lg border border-neutral-100 p-1.5 flex flex-col gap-1.5 shadow-sm relative">
            <div className="w-2/3 h-1.5 bg-primary/30 rounded-full mb-1"></div>
            <div className="w-full h-10 bg-primary/10 rounded border border-primary/30 ring-2 ring-primary/20 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
            </div>
          </div>
          {/* Col 3: Done */}
          <div className="flex-1 h-full bg-white rounded-lg border border-neutral-100 p-1.5 flex flex-col gap-1.5 shadow-sm">
            <div className="w-1/2 h-1.5 bg-success/30 rounded-full mb-1"></div>
            <div className="w-full h-6 bg-success/10 rounded border border-success/20"></div>
            <div className="w-full h-6 bg-success/10 rounded border border-success/20"></div>
          </div>

          {/* Floating cursor hint */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-primary z-10 opacity-80">
            <MousePointer2 className="w-3 h-3" />
          </div>
        </motion.div>

        {/* Text Content */}
        <motion.div
          className="text-center"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-2xl font-bold text-neutral-800 tracking-tight">Kamu siap!</h1>
          <p className="text-base text-neutral-500 mt-2">Mari kenalan dengan fitur-fitur Gamatutor</p>
        </motion.div>

        {/* Feature Cards List */}
        <div className="mt-8 flex flex-col gap-3">
          {[
            {
              icon: LayoutGrid,
              title: "Kanban Board",
              desc: "Atur tugas dengan swipe & progress",
              delay: 0.2,
            },
            {
              icon: Target,
              title: "Goal Tracking",
              desc: "Pantau progress tujuan belajarmu",
              delay: 0.3,
            },
            {
              icon: Trophy,
              title: "Badges & Rewards",
              desc: "Raih pencapaian setiap milestone",
              delay: 0.4,
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              className="bg-white border border-neutral-100 rounded-xl p-4 flex items-start gap-4 hover:border-primary/30 hover:shadow-md transition-all shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: feature.delay }}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 pt-0.5">
                <h3 className="font-bold text-neutral-800 text-base">{feature.title}</h3>
                <p className="text-sm text-neutral-500 mt-1 leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Fixed Footer with Button */}
      <motion.footer
        className="fixed bottom-0 left-0 w-full bg-white border-t border-neutral-100 px-6 pb-[34px] pt-4 z-40 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-sm mx-auto w-full">
          <Button
            onClick={onComplete}
            className="py-4 text-lg shadow-[0_8px_16px_-4px_rgba(59,130,246,0.3)] rounded-xl"
            leftIcon={<Sparkles className="w-5 h-5" />}
          >
            Mulai Tour
          </Button>
        </div>
      </motion.footer>
    </>
  );
}

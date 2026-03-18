"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { BookOpen, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface Step2GoalSettingProps {
  onNext: (goal: string) => void;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

const SUGGESTED_GOALS = [
  "Meningkatkan IPK",
  "Menguasai skill baru",
  "Lulus tepat waktu",
];

export function Step2GoalSetting({ onNext }: Step2GoalSettingProps) {
  const [goal, setGoal] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goal.trim()) {
      onNext(goal);
    }
  };

  return (
    <>
      <div className="flex-1 flex flex-col justify-start text-left max-w-sm mx-auto w-full pt-6 pb-32">
        <motion.div
          className="mb-8"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 overflow-hidden shadow-sm">
            <Image 
              src="/icon-512x512-secondary.svg" 
              alt="Goal Icon" 
              width={56} 
              height={56} 
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold text-neutral-800 tracking-tight mb-3">
            Apa tujuan utama belajarmu semester ini?
          </h1>
          <p className="text-neutral-500 text-[15px] leading-relaxed">
            Tetapkan satu tujuan besar yang ingin kamu capai. Ini akan menjadi kompas belajarmu dalam mengelola waktu dan tugas.
          </p>
        </motion.div>

        <motion.form
          id="goal-form"
          className="space-y-6"
          onSubmit={handleSubmit}
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.1 }}
        >
          <Input
            id="input-goal"
            type="text"
            placeholder="Contoh: Lulus dengan IPK 3.5"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            required
            className="pl-12" // Extra padding for the icon
            iconWrapper={
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 flex items-center transition-colors peer-focus:text-primary">
                <BookOpen className="w-5 h-5" />
              </div>
            }
          />

          <div className="flex flex-wrap gap-2">
            {SUGGESTED_GOALS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setGoal(suggestion)}
                className="px-4 py-2 bg-white border border-neutral-200 rounded-full text-sm font-medium text-neutral-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all active:scale-95"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </motion.form>
      </div>

      {/* Fixed Footer with Button */}
      <motion.footer
        className="fixed bottom-0 left-0 w-full bg-white border-t border-neutral-100 px-6 pb-[34px] pt-4 z-40"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-sm mx-auto w-full">
          <Button
            type="submit"
            form="goal-form"
            className="py-4 text-[17px] shadow-[0_4px_14px_rgba(59,130,246,0.25)] rounded-xl"
            rightIcon={<ArrowRight className="w-5 h-5" />}
            disabled={!goal.trim()}
          >
            Lanjut
          </Button>
        </div>
      </motion.footer>
    </>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, MinusCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface ReflectionData {
  q1_strategy: string;
  q2_confidence: number | null;
  q3_improvement: string;
  q4_value: string | null;
}

interface ReflectionFormProps {
  strategyName: string;
  mainGoal: string;
  onChange: (data: ReflectionData) => void;
}

export function ReflectionForm({ strategyName, mainGoal, onChange }: ReflectionFormProps) {
  const [strategyRating, setStrategyRating] = useState<number | null>(null);
  const [confidenceRating, setConfidenceRating] = useState<number | null>(null);
  const [goalAlignment, setGoalAlignment] = useState<string | null>(null);
  const [futureNotes, setFutureNotes] = useState("");

  // Notify parent of changes
  useEffect(() => {
    onChange({
      q1_strategy: strategyRating !== null ? STRATEGY_LABELS[strategyRating] || "" : "",
      q2_confidence: confidenceRating,
      q3_improvement: futureNotes,
      q4_value: goalAlignment,
    });
  }, [strategyRating, confidenceRating, goalAlignment, futureNotes, onChange]);

  const strategyEmojis = ["😟", "😐", "😊", "😁", "🤩"];
  const confidenceEmojis = ["🤔", "🙂", "😌", "😎", "🚀"];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="space-y-10 pb-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Q1: Strategy Effectiveness */}
      <motion.section variants={itemVariants} className="space-y-4">
        <h3 className="text-base font-bold text-neutral-800 leading-snug">
          Seberapa efektif strategi{" "}
          <span className="text-primary bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10">
            {strategyName}
          </span>{" "}
          bagimu?
        </h3>
        <div className="flex justify-between items-center px-1">
          {strategyEmojis.map((emoji, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setStrategyRating(index + 1)}
              className={cn(
                "text-4xl transition-all duration-300 transform active:scale-90",
                strategyRating === index + 1
                  ? "grayscale-0 opacity-100 scale-125 -translate-y-1 drop-shadow-md"
                  : "grayscale opacity-40 hover:grayscale-0 hover:opacity-100"
              )}
            >
              {emoji}
            </button>
          ))}
        </div>
      </motion.section>

      {/* Q2: Mastery Confidence */}
      <motion.section variants={itemVariants} className="space-y-4">
        <h3 className="text-base font-bold text-neutral-800 leading-snug">
          Seberapa yakin kamu menguasai materi ini sekarang?
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1 relative">
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-neutral-100 rounded-full -z-10" />
            {confidenceEmojis.map((emoji, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setConfidenceRating(index + 1)}
                className={cn(
                  "w-11 h-11 bg-white flex items-center justify-center text-2xl rounded-full border-2 transition-all duration-300 shadow-sm",
                  confidenceRating === index + 1
                    ? "border-primary bg-blue-50 grayscale-0 scale-125 z-10"
                    : "border-transparent grayscale opacity-50 z-0"
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1">
            <span>Masih Ragu</span>
            <span>Sangat Yakin</span>
          </div>
        </div>
      </motion.section>

      {/* Q3: Goal Alignment */}
      <motion.section variants={itemVariants} className="space-y-4">
        <h3 className="text-base font-bold text-neutral-800 leading-snug">
          Apakah tugas ini membantumu mencapai{" "}
          <span className="text-primary font-black underline decoration-primary/20 underline-offset-4">
            {mainGoal}
          </span>
          ?
        </h3>
        <div className="flex gap-3">
          {[
            {
              id: "ya",
              label: "Ya",
              icon: CheckCircle,
              active: "border-emerald-500 bg-emerald-50 text-emerald-700",
            },
            {
              id: "sebagian",
              label: "Sebagian",
              icon: MinusCircle,
              active: "border-amber-500 bg-amber-50 text-amber-700",
            },
            {
              id: "tidak",
              label: "Tidak",
              icon: XCircle,
              active: "border-rose-500 bg-rose-50 text-rose-700",
            },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setGoalAlignment(opt.id)}
              className={cn(
                "flex-1 py-3 px-1 flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 transition-all duration-200",
                goalAlignment === opt.id
                  ? opt.active
                  : "border-neutral-100 bg-white text-neutral-400 hover:bg-neutral-50"
              )}
            >
              <opt.icon
                className={cn(
                  "w-5 h-5",
                  goalAlignment === opt.id ? "" : "opacity-50"
                )}
              />
              <span className="text-sm font-black">{opt.label}</span>
            </button>
          ))}
        </div>
      </motion.section>

      {/* Q4: Future Notes */}
      <motion.section variants={itemVariants} className="space-y-3">
        <h3 className="text-base font-bold text-neutral-800 leading-snug">
          Ada catatan untuk dirimu di masa depan?{" "}
          <span className="text-neutral-400 font-medium text-sm">(Opsional)</span>
        </h3>
        <textarea
          value={futureNotes}
          onChange={(e) => setFutureNotes(e.target.value)}
          className="w-full h-32 p-4 bg-neutral-50 border border-neutral-200 rounded-[24px] text-base text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none leading-relaxed"
          placeholder="Misal: Perlu latihan lebih banyak di bagian iterasi dalam..."
        ></textarea>
      </motion.section>
    </motion.div>
  );
}

const STRATEGY_LABELS: Record<number, string> = {
  1: "Tidak efektif",
  2: "Kurang efektif",
  3: "Cukup efektif",
  4: "Efektif",
  5: "Sangat efektif",
};

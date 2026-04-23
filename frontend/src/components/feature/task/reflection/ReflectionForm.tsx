"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, MinusCircle, XCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface ReflectionData {
  q1_strategy: number | null;
  q2_confidence: number | null;
  q3_improvement: string;
  q4_value: string | null;
  post_test_grade?: number | null;
}

interface ReflectionFormProps {
  strategyName: string;
  mainGoal: string;
  preTestGrade?: number | null;
  onChange: (data: ReflectionData, isValid: boolean) => void;
}

export function ReflectionForm({ strategyName, mainGoal, preTestGrade, onChange }: ReflectionFormProps) {
  const [strategyRating, setStrategyRating] = useState<number | null>(null);
  const [confidenceRating, setConfidenceRating] = useState<number | null>(null);
  const [goalAlignment, setGoalAlignment] = useState<string | null>(null);
  const [futureNotes, setFutureNotes] = useState("");
  const [postGrade, setPostGrade] = useState<string>("");
  const [postGradeError, setPostGradeError] = useState("");

  const isValid = strategyRating !== null && confidenceRating !== null && goalAlignment !== null;

  useEffect(() => {
    onChange(
      {
        q1_strategy: strategyRating,
        q2_confidence: confidenceRating,
        q3_improvement: futureNotes,
        q4_value: goalAlignment,
        post_test_grade: postGrade !== "" ? parseFloat(postGrade) : null,
      },
      isValid
    );
  }, [strategyRating, confidenceRating, goalAlignment, futureNotes, postGrade, onChange, isValid]);

  const handlePostGradeChange = (value: string) => {
    if (value === "") {
      setPostGrade("");
      setPostGradeError("");
      return;
    }
    const num = parseFloat(value);
    if (isNaN(num)) return;
    if (num < 0 || num > 100) {
      setPostGradeError("Nilai harus antara 0-100");
    } else {
      setPostGradeError("");
    }
    setPostGrade(value);
  };

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
          <span className="text-error ml-0.5">*</span>
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
          <span className="text-error ml-0.5">*</span>
        </h3>
        <div className="flex justify-between items-center px-1">
          {confidenceEmojis.map((emoji, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setConfidenceRating(index + 1)}
              className={cn(
                "text-4xl transition-all duration-300 transform active:scale-90",
                confidenceRating === index + 1
                  ? "grayscale-0 opacity-100 scale-125 -translate-y-1 drop-shadow-md"
                  : "grayscale opacity-40 hover:grayscale-0 hover:opacity-100"
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
      </motion.section>

      {/* Q3: Goal Alignment */}
      <motion.section variants={itemVariants} className="space-y-4">
        <h3 className="text-base font-bold text-neutral-800 leading-snug">
          Apakah tugas ini membantumu mencapai{" "}
          <span className="text-primary font-black underline decoration-primary/20 underline-offset-4">
            {mainGoal}
          </span>
          ?
          <span className="text-error ml-0.5">*</span>
        </h3>
        <div className="flex gap-3">
          {[
            { id: "ya", label: "Ya", icon: CheckCircle, active: "border-emerald-500 bg-emerald-50 text-emerald-700" },
            { id: "sebagian", label: "Sebagian", icon: MinusCircle, active: "border-amber-500 bg-amber-50 text-amber-700" },
            { id: "tidak", label: "Tidak", icon: XCircle, active: "border-rose-500 bg-rose-50 text-rose-700" },
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
              <opt.icon className={cn("w-5 h-5", goalAlignment === opt.id ? "" : "opacity-50")} />
              <span className="text-sm font-black">{opt.label}</span>
            </button>
          ))}
        </div>
      </motion.section>

      {/* Q4: Future Notes (Optional) */}
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

      {/* Post-Test Grade (Optional) */}
      <motion.section variants={itemVariants} className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-neutral-400" />
          <h3 className="text-base font-bold text-neutral-800 leading-snug">
            Nilai Post-Test
          </h3>
          <span className="text-neutral-400 font-medium text-sm">(Opsional)</span>
        </div>

        <p className="text-xs text-neutral-400 font-medium leading-relaxed -mt-1">
          Bandingkan dengan pre-test untuk melihat seberapa besar peningkatanmu.
        </p>

        {preTestGrade !== null && preTestGrade !== undefined && (
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-xl border border-blue-100">
            <span className="text-xs font-semibold text-blue-600">Pre-test: {preTestGrade}</span>
          </div>
        )}

        {preTestGrade === null || preTestGrade === undefined ? (
          <div className="px-3 py-2 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-xs text-amber-700 font-medium">
              Belum ada nilai pre-test. Peningkatan nilai hanya bisa dihitung jika keduanya terisi.
            </p>
          </div>
        ) : null}

        <div className="relative">
          <input
            type="number"
            value={postGrade}
            onChange={(e) => handlePostGradeChange(e.target.value)}
            min={0}
            max={100}
            placeholder="Contoh: 85"
            className={cn(
              "w-full h-12 px-4 pr-14 bg-neutral-50 border rounded-2xl text-base text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all",
              postGradeError ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-neutral-200"
            )}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-400">
            / 100
          </span>
        </div>
        {postGradeError && (
          <p className="text-xs text-red-500 font-medium -mt-1">{postGradeError}</p>
        )}
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

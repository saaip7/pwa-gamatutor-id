"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Joyride, STATUS } from "react-joyride";
import { ProgressHeader } from "@/components/feature/progress/ProgressHeader";
import { InsightCard } from "@/components/feature/progress/InsightCard";
import { PeriodSelector } from "@/components/feature/progress/PeriodSelector";
import { ProgressSummary, SummaryData } from "@/components/feature/progress/ProgressSummary";
import { MasteryTrendChart } from "@/components/feature/progress/MasteryTrendChart";
import { TaskDistributionChart, TaskDistributionData } from "@/components/feature/progress/TaskDistributionChart";
import { LearningStrategies, StrategyItem } from "@/components/feature/progress/LearningStrategies";
import { AchievementBanner } from "@/components/feature/mastery/AchievementBanner";
import type { ConfidenceDataPoint, ReflectionNote } from "@/types";

// ─── Dummy Data ─────────────────────────────────────────────────

const DUMMY_ACTIVE_PERIOD = "week" as const;

const DUMMY_SUMMARY: SummaryData = {
  totalCards: 12,
  completedCards: 5,
  completionRate: 42,
  personalBest: "45:00",
};

const DUMMY_TASK_DIST: TaskDistributionData = {
  total: 12,
  todoPercent: 25,
  progPercent: 33,
  revPercent: 0,
  donePercent: 42,
};

const DUMMY_STRATEGIES: StrategyItem[] = [
  { id: "strat-0", name: "Pomodoro Technique", emoji: "🤩", score: 4.5, taskCount: 3 },
  { id: "strat-1", name: "Active Recall", emoji: "😊", score: 4.0, taskCount: 2 },
  { id: "strat-2", name: "Spaced Repetition", emoji: "🤔", score: 3.5, taskCount: 1 },
];

const DUMMY_TREND: ConfidenceDataPoint[] = [
  { date: "2026-04-10", confidence: 3.0, learningGain: 0 },
  { date: "2026-04-11", confidence: 3.2, learningGain: 0.2 },
  { date: "2026-04-12", confidence: 3.5, learningGain: 0.3 },
  { date: "2026-04-13", confidence: 3.3, learningGain: -0.2 },
  { date: "2026-04-14", confidence: 3.8, learningGain: 0.5 },
  { date: "2026-04-15", confidence: 4.0, learningGain: 0.2 },
];

const DUMMY_REFLECTION_NOTES: ReflectionNote[] = [
  {
    card_id: "c1",
    task_name: "Tugas Klasifikasi",
    course_code: "IF-302",
    strategy: "Pomodoro Technique",
    completed_at: "2026-04-15T10:30:00Z",
    q3_improvement: "Perlu lebih sering latihan soal untuk memahami konsep decision tree lebih dalam.",
  },
  {
    card_id: "c2",
    task_name: "Laporan Jaringan",
    course_code: "IF-401",
    strategy: "Active Recall",
    completed_at: "2026-04-14T14:00:00Z",
    q3_improvement: "Fokus pada topologi jaringan, masih bingung bagian routing.",
  },
  {
    card_id: "c3",
    task_name: "Quiz Statistika",
    course_code: "ST-301",
    strategy: "Spaced Repetition",
    completed_at: "2026-04-13T09:00:00Z",
    q3_improvement: "Review rumus distribusi normal lagi sebelum quiz berikutnya.",
  },
];

// ─── Joyride Steps ──────────────────────────────────────────────

const steps = [
  {
    target: "#guide-progress-insight",
    content: "Di sini kamu bisa melihat insight belajar, seperti waktu produktif dan pencapaianmu.",
    disableBeacon: true,
  },
  {
    target: "#guide-progress-summary",
    content: "Ringkasan progress: total tugas, tingkat penyelesaian, dan personal best timemu.",
    disableBeacon: true,
  },
  {
    target: "#guide-progress-chart",
    content: "Grafik tren pemahaman membantu kamu melihat perkembangan dari waktu ke waktu.",
    disableBeacon: true,
  },
  {
    target: "#guide-progress-reflections",
    content: "Catatan refleksi dari tugas yang sudah selesai. Bisa dilihat lengkap di halaman terpisah.",
    disableBeacon: true,
  },
];

// ─── Page ───────────────────────────────────────────────────────

export default function GuideStep4Page() {
  const router = useRouter();
  const [activePeriod] = useState<"week" | "month" | "all">(DUMMY_ACTIVE_PERIOD);
  const [run] = useState(true);

  const handleJoyrideCallback = (data: { status: string }) => {
    if (data.status === STATUS.FINISHED) {
      router.push("/onboarding/guide/step-5");
    }
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col mx-auto overflow-hidden relative max-w-md">
      {/* Progress bar */}
      <div className="shrink-0 pt-3 px-5 sticky top-0 bg-white z-40">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Langkah 4 dari 5</span>
          <span className="text-[10px] font-bold text-primary">80%</span>
        </div>
        <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: "80%" }} />
        </div>
      </div>

      <ProgressHeader />

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-4 pb-28">
        {/* Insight */}
        <div id="guide-progress-insight">
          <InsightCard productiveTime="Malam (18:00-24:00) (45%)" productiveDays="Senin (30%)" />
        </div>

        <PeriodSelector
          activePeriod={activePeriod}
          onPeriodChange={() => {}}
        />

        <AchievementBanner
          unlockedCount={1}
          totalCount={5}
          variant="progress"
          className="mt-4"
        />

        {/* Summary */}
        <div id="guide-progress-summary">
          <ProgressSummary data={DUMMY_SUMMARY} />
        </div>

        {/* Trend Chart */}
        <div id="guide-progress-chart">
          <MasteryTrendChart
            dataPoints={DUMMY_TREND}
            trend="improving"
            courseCode={null}
            availableCourses={[]}
            onCourseChange={() => {}}
          />
        </div>

        {/* Full-width stacked components */}
        <div className="flex flex-col gap-1">
          <TaskDistributionChart data={DUMMY_TASK_DIST} />

          <LearningStrategies strategies={DUMMY_STRATEGIES} />

          {/* Catatan Refleksi */}
          <motion.div
            id="guide-progress-reflections"
            className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm mt-1 mb-4 w-full"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2 uppercase tracking-wider">
                Catatan Refleksi
              </h3>
              <Link
                href="/progress/reflection-notes"
                className="text-[11px] font-bold text-primary flex items-center gap-1 hover:text-primary/80 transition-colors"
              >
                Lihat Semua
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {DUMMY_REFLECTION_NOTES.map((note) => {
                const formattedDate = note.completed_at
                  ? new Date(note.completed_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })
                  : null;

                return (
                  <div
                    key={note.card_id}
                    className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4"
                  >
                    <p className="text-sm text-neutral-700 italic leading-relaxed line-clamp-2">
                      &ldquo;{note.q3_improvement}&rdquo;
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2.5">
                      <span className="text-xs font-semibold text-neutral-800 truncate max-w-[120px]">
                        {note.task_name}
                      </span>
                      {note.course_code && (
                        <>
                          <span className="text-[10px] text-neutral-300">&#x2022;</span>
                          <span className="text-[11px] text-neutral-500 font-medium">
                            {note.course_code}
                          </span>
                        </>
                      )}
                      {formattedDate && (
                        <>
                          <span className="text-[10px] text-neutral-300">&#x2022;</span>
                          <span className="text-[11px] text-neutral-400">
                            {formattedDate}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Joyride */}
      <Joyride
        run={run}
        steps={steps}
        continuous={true}
        options={{
          showProgress: true,
          primaryColor: "#3b82f6",
          backgroundColor: "#ffffff",
          textColor: "#262626",
          arrowColor: "#ffffff",
          skipBeacon: true,
          width: 320,
        }}
        styles={{
          tooltipContainer: { textAlign: "left" },
          buttonPrimary: { background: "#3b82f6" },
        }}
        locale={{ last: "Selesai" }}
        onEvent={handleJoyrideCallback}
      />
    </div>
  );
}

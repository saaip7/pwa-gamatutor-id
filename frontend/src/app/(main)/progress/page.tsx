"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProgressHeader } from "@/components/feature/progress/ProgressHeader";
import { InsightCard } from "@/components/feature/progress/InsightCard";
import { PeriodSelector } from "@/components/feature/progress/PeriodSelector";
import { ProgressSummary, SummaryData } from "@/components/feature/progress/ProgressSummary";
import { MasteryTrendChart } from "@/components/feature/progress/MasteryTrendChart";
import { TaskDistributionChart, TaskDistributionData } from "@/components/feature/progress/TaskDistributionChart";
import { LearningStrategies, StrategyItem } from "@/components/feature/progress/LearningStrategies";

import { AchievementBanner } from "@/components/feature/mastery/AchievementBanner";
import { useAnalyticsStore } from "@/stores/analytics";
import { useBadgesStore } from "@/stores/badges";
import type { ConfidenceDataPoint, ReflectionNote } from "@/types";

export default function ProgressPage() {
  const [activePeriod, setActivePeriod] = useState<"week" | "month" | "all">("week");
  const {
    progress,
    strategies,
    dashboard,
    confidenceTrend,
    reflectionNotes,
    loading,
    fetchProgress,
    fetchStrategies,
    fetchDashboard,
    fetchConfidenceTrend,
    fetchReflectionNotes,
  } = useAnalyticsStore();
  const { unlockedCount, badges, fetchBadges } = useBadgesStore();

  useEffect(() => {
    fetchProgress();
    fetchStrategies();
    fetchDashboard();
    fetchConfidenceTrend();
    fetchReflectionNotes();
    fetchBadges();
  }, [fetchProgress, fetchStrategies, fetchDashboard, fetchConfidenceTrend, fetchReflectionNotes, fetchBadges]);

  const handleCourseChange = (courseCode: string | null) => {
    fetchConfidenceTrend(courseCode ?? undefined);
  };

  const totalBadges = badges.length || 1; // avoid divide-by-zero

  // Map progress.summary -> SummaryData
  const summaryData: SummaryData | null = progress?.summary
    ? {
        totalCards: progress.summary.totalCards,
        completedCards: progress.summary.completedCards,
        completionRate: progress.summary.completionRate,
        personalBest: progress.summary.personalBest,
      }
    : null;

  // Map progress.taskDistribution -> TaskDistributionData
  const taskDistData: TaskDistributionData | null = progress?.taskDistribution
    ? {
        total: progress.taskDistribution.total,
        todoPercent: progress.taskDistribution.todoPercent,
        progPercent: progress.taskDistribution.progPercent,
        revPercent: progress.taskDistribution.revPercent,
        donePercent: progress.taskDistribution.donePercent,
      }
    : null;

  // Map strategies -> StrategyItem[]
  const strategyItems: StrategyItem[] = (strategies?.strategies ?? []).map((s, i) => {
    const emoji =
      s.subjective.avgRating >= 4.5
        ? "🤩"
        : s.subjective.avgRating >= 4.0
          ? "😊"
          : s.subjective.avgRating >= 3.0
            ? "🤔"
            : "😐";
    return {
      id: `strat-${i}`,
      name: s.name,
      emoji,
      score: s.subjective.avgRating,
      taskCount: s.taskCount,
    };
  });

  // Derive insight text from dashboard patterns
  const insightText = useMemo(() => {
    const patterns = dashboard?.patterns;
    if (!patterns || (patterns.productiveTime === "-" && patterns.productiveDays === "-")) {
      return null;
    }
    const parts: string[] = [];
    if (patterns.productiveTime && patterns.productiveTime !== "-") {
      parts.push(`Waktu produktif: ${patterns.productiveTime}`);
    }
    if (patterns.productiveDays && patterns.productiveDays !== "-") {
      parts.push(`Hari produktif: ${patterns.productiveDays}`);
    }
    return parts.length > 0 ? parts.join(" | ") : null;
  }, [dashboard]);

  // Confidence trend data points for chart
  const trendDataPoints: ConfidenceDataPoint[] = confidenceTrend?.dataPoints ?? [];
  const trendCourseCode = confidenceTrend?.courseCode ?? null;
  const trendCourses = confidenceTrend?.availableCourses ?? [];

  if (loading && !progress) {
    return (
      <>
        <ProgressHeader />
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <ProgressHeader />

      <div className="px-6 pt-4 pb-28">
        {insightText ? (
          <InsightCard insightText={insightText} />
        ) : (
          <InsightCard insightText="Mulai selesaikan tugas untuk mendapatkan insight personal!" />
        )}

        <PeriodSelector
          activePeriod={activePeriod}
          onPeriodChange={setActivePeriod}
        />

        <AchievementBanner
          unlockedCount={unlockedCount}
          totalCount={totalBadges}
          variant="progress"
          className="mt-4"
        />

        {summaryData ? (
          <ProgressSummary data={summaryData} />
        ) : (
          <div className="bg-white border border-neutral-200 rounded-xl p-5 mt-4 shadow-sm text-center">
            <p className="text-sm text-neutral-400">Belum ada data progress. Mulai selesaikan tugas untuk melihat perkembanganmu!</p>
          </div>
        )}

        <MasteryTrendChart
          dataPoints={trendDataPoints}
          trend={confidenceTrend?.trend ?? null}
          courseCode={trendCourseCode}
          availableCourses={trendCourses}
          onCourseChange={handleCourseChange}
        />

        {/* Full-width Stacked Components */}
        <div className="flex flex-col gap-1">
          {taskDistData ? (
            <TaskDistributionChart data={taskDistData} />
          ) : (
            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm mt-4 w-full text-center">
              <p className="text-sm text-neutral-400">Belum ada distribusi tugas. Buat tugas di kanban board untuk melihat datanya.</p>
            </div>
          )}

          <LearningStrategies strategies={strategyItems.length > 0 ? strategyItems : []} />

          {/* Catatan Refleksi */}
          <motion.div
            className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm mt-1 mb-4 w-full"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2 uppercase tracking-wider">
                Catatan Refleksi
              </h3>
              {reflectionNotes && reflectionNotes.length > 0 && (
                <Link
                  href="/progress/reflection-notes"
                  className="text-[11px] font-bold text-primary flex items-center gap-1 hover:text-primary/80 transition-colors"
                >
                  Lihat Semua
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>

            {reflectionNotes && reflectionNotes.length > 0 ? (
              <div className="space-y-3">
                {reflectionNotes.slice(0, 3).map((note: ReflectionNote) => {
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
                {reflectionNotes.length > 3 && (
                  <Link
                    href="/progress/reflection-notes"
                    className="block text-center text-xs font-bold text-primary py-2 hover:text-primary/80 transition-colors"
                  >
                    +{reflectionNotes.length - 3} catatan lainnya
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-sm text-neutral-400 text-center py-4">
                Belum ada catatan refleksi. Tulis catatan saat menyelesaikan refleksi tugas!
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}

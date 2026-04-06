"use client";

import React, { useEffect, useState } from "react";
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

export default function ProgressPage() {
  const [activePeriod, setActivePeriod] = useState<"week" | "month" | "all">("week");
  const { progress, strategies, loading, fetchProgress, fetchStrategies } = useAnalyticsStore();
  const { unlockedCount, badges, fetchBadges } = useBadgesStore();

  useEffect(() => {
    fetchProgress();
    fetchStrategies();
    fetchBadges();
  }, [fetchProgress, fetchStrategies, fetchBadges]);

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
        <InsightCard insightText="Best productivity: Wednesday, 9:00 PM" />

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

        {summaryData && <ProgressSummary data={summaryData} />}

        <MasteryTrendChart />

        {/* Full-width Stacked Components */}
        <div className="flex flex-col gap-1">
          {taskDistData && <TaskDistributionChart data={taskDistData} />}
          {strategyItems.length > 0 && <LearningStrategies strategies={strategyItems} />}
        </div>
      </div>
    </>
  );
}

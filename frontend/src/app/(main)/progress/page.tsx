"use client";

import React, { useState } from "react";
import { ProgressHeader } from "@/components/feature/progress/ProgressHeader";
import { InsightCard } from "@/components/feature/progress/InsightCard";
import { PeriodSelector } from "@/components/feature/progress/PeriodSelector";
import { ProgressSummary, SummaryData } from "@/components/feature/progress/ProgressSummary";
import { MasteryTrendChart } from "@/components/feature/progress/MasteryTrendChart";
import { TaskDistributionChart, TaskDistributionData } from "@/components/feature/progress/TaskDistributionChart";
import { LearningStrategies, StrategyItem } from "@/components/feature/progress/LearningStrategies";

// TODO: Fetch from API
const MOCK_PROGRESS_DATA = {
  insightText: "Best productivity: Wednesday, 9:00 PM",
  summary: {
    totalCards: 32,
    completedCards: 24,
    completionRate: 75,
    personalBest: "2h 15m",
  } as SummaryData,
  taskDistribution: {
    total: 24,
    todoPercent: 25,
    progPercent: 25,
    revPercent: 15,
    donePercent: 35,
  } as TaskDistributionData,
  strategies: [
    {
      id: "strat-1",
      name: "Video Tutorial",
      emoji: "😊",
      score: 4.5,
      taskCount: 12,
    },
    {
      id: "strat-2",
      name: "Practice Questions",
      emoji: "🤓",
      score: 4.2,
      taskCount: 8,
    },
    {
      id: "strat-3",
      name: "Mind Mapping",
      emoji: "🧠",
      score: 3.5,
      taskCount: 5,
    },
  ] as StrategyItem[],
};

export default function ProgressPage() {
  const [activePeriod, setActivePeriod] = useState<"week" | "month" | "all">("week");

  return (
    <>
      <ProgressHeader />
      
      <div className="px-6 pt-4 pb-28">
        <InsightCard insightText={MOCK_PROGRESS_DATA.insightText} />
        
        <PeriodSelector 
          activePeriod={activePeriod} 
          onPeriodChange={setActivePeriod} 
        />
        
        <ProgressSummary data={MOCK_PROGRESS_DATA.summary} />
        
        <MasteryTrendChart />
        
        {/* Full-width Stacked Components (Updated from 50/50 split) */}
        <div className="flex flex-col gap-1">
          <TaskDistributionChart data={MOCK_PROGRESS_DATA.taskDistribution} />
          <LearningStrategies strategies={MOCK_PROGRESS_DATA.strategies} />
        </div>
      </div>
    </>
  );
}

"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Info, LucideIcon, PenTool, Video, BookOpen, MessageCircle, HelpCircle } from "lucide-react";
import { StrategyInsightBanner } from "@/components/feature/progress/strategies/StrategyInsightBanner";
import { StrategyPerformanceCard, StrategyPerformanceData } from "@/components/feature/progress/strategies/StrategyPerformanceCard";
import { useAnalyticsStore } from "@/stores/analytics";

// Default icon mapping for common strategy names
function strategyIcon(name: string): LucideIcon {
  const lower = name.toLowerCase();
  if (lower.includes("latihan") || lower.includes("soal") || lower.includes("practice")) return PenTool;
  if (lower.includes("video") || lower.includes("tutorial")) return Video;
  if (lower.includes("baca") || lower.includes("membaca") || lower.includes("read") || lower.includes("materi")) return BookOpen;
  if (lower.includes("diskusi") || lower.includes("group") || lower.includes("discussion")) return MessageCircle;
  return HelpCircle;
}

// Emoji for rating
function ratingEmoji(rating: number): string {
  if (rating >= 4.5) return "🤩";
  if (rating >= 4.0) return "😊";
  if (rating >= 3.0) return "🤔";
  return "😐";
}

export default function StrategyEffectivenessPage() {
  const router = useRouter();
  const { strategies, loading, fetchStrategies } = useAnalyticsStore();

  useEffect(() => {
    fetchStrategies();
  }, [fetchStrategies]);

  const mappedStrategies: StrategyPerformanceData[] = useMemo(() => {
    if (!strategies?.strategies) return [];
    return strategies.strategies.map((s, i) => {
      const icon = strategyIcon(s.name);
      const isTop = i === 0;
      const hasData = s.taskCount > 0;

      return {
        id: `strat-${i}`,
        name: s.name,
        category: "", // API doesn't provide category; can be derived later
        icon,
        iconBg: hasData ? "bg-purple-50" : "bg-neutral-50",
        iconColor: hasData ? "text-purple-600" : "text-neutral-400",
        isTop: isTop && hasData,
        isUnused: !hasData,
        ...(hasData
          ? {
              subjective: {
                rating: s.subjective.avgRating,
                totalTasks: s.subjective.totalRated,
                positivePercent: s.subjective.positivePercent,
                emoji: ratingEmoji(s.subjective.avgRating),
              },
              objective: {
                improvement: s.objective.avgImprovement,
                totalTasks: s.objective.totalTracked,
                isDataInsufficient: s.objective.isDataInsufficient,
              },
            }
          : {}),
      };
    });
  }, [strategies]);

  // Top strategy for insight banner
  const topStrategy = strategies?.strategies?.[0];
  const topName = topStrategy?.name ?? "—";
  const topImprovement = topStrategy?.objective?.avgImprovement ?? 0;

  return (
    <div className="w-full h-screen bg-neutral-50 flex flex-col mx-auto overflow-hidden relative max-w-md">
      {/* Header */}
      <header className="shrink-0 pt-14 pb-4 px-5 bg-white border-b border-neutral-100 flex items-center justify-between sticky top-0 z-20">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center -ml-2 text-neutral-600 active:bg-neutral-50 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5.5 h-5.5" />
        </button>
        <h1 className="font-bold text-lg md:text-xl tracking-tight text-neutral-900">Efektivitas Strategi</h1>
        <button className="w-10 h-10 flex items-center justify-center -mr-2 text-neutral-400 active:bg-neutral-50 rounded-full transition-colors">
          <Info className="w-5.5 h-5.5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pt-6 pb-[34px] space-y-8">
        {loading && !strategies ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {topStrategy && topStrategy.taskCount > 0 && (
              <StrategyInsightBanner
                strategyName={topName}
                impactPercent={topImprovement}
              />
            )}

            <section className="space-y-5">
              <div className="flex items-center justify-between px-1">
                <h2 className="font-bold text-lg text-neutral-900 tracking-tight">Kinerja Strategi</h2>
                <span className="text-[11px] font-bold text-neutral-500 bg-neutral-200/50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Bulan Ini
                </span>
              </div>

              <div className="space-y-4 pb-10">
                {mappedStrategies.length > 0 ? (
                  mappedStrategies.map((strat, idx) => (
                    <StrategyPerformanceCard key={strat.id} data={strat} index={idx} />
                  ))
                ) : (
                  <div className="text-center py-12 text-neutral-400 text-sm">
                    Belum ada data strategi
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

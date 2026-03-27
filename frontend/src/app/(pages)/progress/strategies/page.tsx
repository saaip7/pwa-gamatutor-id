"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Info, PenTool, Video, BookOpen, MessageCircle } from "lucide-react";
import { StrategyInsightBanner } from "@/components/feature/progress/strategies/StrategyInsightBanner";
import { StrategyPerformanceCard, StrategyPerformanceData } from "@/components/feature/progress/strategies/StrategyPerformanceCard";

const MOCK_STRATEGIES: StrategyPerformanceData[] = [
  {
    id: "1",
    name: "Latihan Soal",
    category: "Pembelajaran Aktif",
    icon: PenTool,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    isTop: true,
    subjective: {
      rating: 4.8,
      totalTasks: 25,
      positivePercent: 96,
      emoji: "🤩"
    },
    objective: {
      improvement: 40,
      totalTasks: 25
    }
  },
  {
    id: "2",
    name: "Video Tutorial",
    category: "Pembelajaran Visual",
    icon: Video,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    subjective: {
      rating: 4.2,
      totalTasks: 12,
      positivePercent: 84,
      emoji: "😊"
    },
    objective: {
      improvement: 15,
      totalTasks: 12
    }
  },
  {
    id: "3",
    name: "Membaca Materi",
    category: "Pembelajaran Tekstual",
    icon: BookOpen,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    subjective: {
      rating: 3.5,
      totalTasks: 8,
      positivePercent: 70,
      emoji: "🤔"
    },
    objective: {
      improvement: 0,
      totalTasks: 2,
      isDataInsufficient: true
    }
  },
  {
    id: "4",
    name: "Diskusi Kelompok",
    category: "Pembelajaran Sosial",
    icon: MessageCircle,
    iconBg: "bg-neutral-50",
    iconColor: "text-neutral-400",
    isUnused: true
  }
];

export default function StrategyEffectivenessPage() {
  const router = useRouter();

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
        
        <StrategyInsightBanner 
          strategyName="Latihan Soal" 
          impactPercent={40} 
        />

        <section className="space-y-5">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-bold text-lg text-neutral-900 tracking-tight">Kinerja Strategi</h2>
            <span className="text-[11px] font-bold text-neutral-500 bg-neutral-200/50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Bulan Ini
            </span>
          </div>

          <div className="space-y-4 pb-10">
            {MOCK_STRATEGIES.map((strat, idx) => (
              <StrategyPerformanceCard key={strat.id} data={strat} index={idx} />
            ))}
          </div>
        </section>
        
      </main>
    </div>
  );
}

"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Minimize2, Square, Video, SquareCheckBig } from "lucide-react";
import { FocusTimer } from "@/components/feature/task/focus/FocusTimer";
import { FocusStrategyTip } from "@/components/feature/task/focus/FocusStrategyTip";
import { FocusSubtaskList } from "@/components/feature/task/focus/FocusSubtaskList";
import { MindParking } from "@/components/feature/task/focus/MindParking";

// Mock Data for Slicing
const MOCK_FOCUS_DATA = {
  title: "Review Materi Sorting",
  strategy: "Video Tutorial",
  tip: "Catat poin penting & putar ulang bagian yang sulit.",
  personalBest: "2j 15m",
  subtasks: [
    { id: "s1", text: "Tonton video penjelasan sorting", completed: true },
    { id: "s2", text: "Catat poin penting iterasi", completed: false },
    { id: "s3", text: "Latihan implementasi Bubble Sort", completed: false },
  ]
};

export default function FocusModePage() {
  const router = useRouter();
  const params = useParams();

  const handleFinish = () => {
    // Navigate to reflection page (next step)
    console.log("Session finished for task:", params.id);
    router.back();
  };

  return (
    <div className="w-full h-screen flex flex-col mx-auto bg-white relative overflow-hidden max-w-md">
      
      {/* Header */}
      <header className="shrink-0 pt-14 pb-3 px-5 border-b border-neutral-100 flex items-center justify-between bg-white z-50">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-50 border border-neutral-100 text-neutral-600 active:scale-95 transition-all"
        >
          <Minimize2 className="w-5 h-5" />
        </button>
        
        <div className="flex-1 px-4 text-center">
          <h1 className="text-sm font-bold text-neutral-900 truncate">
            {MOCK_FOCUS_DATA.title}
          </h1>
        </div>

        <button 
          onClick={() => router.back()}
          className="h-10 px-3.5 flex items-center gap-1.5 rounded-xl bg-red-50 text-red-600 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          Akhiri
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-6 py-8 space-y-12">
        
        <FocusStrategyTip 
          strategy={MOCK_FOCUS_DATA.strategy} 
          tip={MOCK_FOCUS_DATA.tip} 
          icon={Video} 
        />

        <FocusTimer personalBest={MOCK_FOCUS_DATA.personalBest} />

        <FocusSubtaskList initialSubtasks={MOCK_FOCUS_DATA.subtasks} />

        <MindParking />

      </main>

      {/* Footer CTA */}
      <footer className="shrink-0 pb-[34px] pt-4 px-6 bg-white border-t border-neutral-100 z-50">
        <button 
          onClick={handleFinish}
          className="w-full h-[56px] bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-[15px] flex items-center justify-center gap-2.5 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all group"
        >
          <SquareCheckBig className="w-5 h-5 group-active:scale-110 transition-transform" />
          Selesai & Beri Refleksi
        </button>
      </footer>
    </div>
  );
}

"use client";

import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Minimize2, Square, Video, SquareCheckBig, Loader2 } from "lucide-react";
import { FocusTimer } from "@/components/feature/task/focus/FocusTimer";
import { FocusStrategyTip } from "@/components/feature/task/focus/FocusStrategyTip";
import { FocusSubtaskList } from "@/components/feature/task/focus/FocusSubtaskList";
import { MindParking } from "@/components/feature/task/focus/MindParking";
import { useBoardStore } from "@/stores/board";

// Default strategy data when the card has no strategy field
const DEFAULT_STRATEGY = {
  name: "Fokus Mandiri",
  tip: "Kerjakan satu langkah pada satu waktu. Catat hal yang mengganggu di Mind Parking.",
  icon: Video,
};

// Map strategy names to icons and tips
const STRATEGY_TIPS: Record<string, { tip: string }> = {
  "Practice Questions": { tip: "Kerjakan soal secara bertahap. Cek jawaban setiap 3-5 soal." },
  "Video Tutorial": { tip: "Catat poin penting & putar ulang bagian yang sulit." },
  "Reading": { tip: "Baca section per section. Buat ringkasan singkat setiap section." },
  "Note Taking": { tip: "Tulis dengan kata-kata sendiri. Gunakan diagram untuk konsep kompleks." },
  "Group Study": { tip: "Bagi topik, diskusi bergantian. Ajukan pertanyaan ke teman." },
};

export default function FocusModePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  // Store
  const tasks = useBoardStore((s) => s.tasks);
  const loading = useBoardStore((s) => s.loading);
  const fetchBoard = useBoardStore((s) => s.fetchBoard);

  const card = tasks[id] ?? null;

  // Fetch board if tasks are empty (deep-linked)
  useEffect(() => {
    if (Object.keys(tasks).length === 0) {
      fetchBoard();
    }
  }, [tasks, fetchBoard]);

  // Map BoardCard subtasks to FocusSubtaskList format
  const subtasks = React.useMemo(() => {
    if (!card?.subtasks?.length) {
      // Default subtasks if none exist
      return [
        { id: "default-1", text: "Pelajari materi utama", completed: false },
        { id: "default-2", text: "Buat catatan ringkas", completed: false },
        { id: "default-3", text: "Latihan / review", completed: false },
      ];
    }
    return card.subtasks.map((st) => ({
      id: st.id,
      text: st.title,
      completed: st.isCompleted,
    }));
  }, [card]);

  // Derive strategy info — BoardCard has no strategy field, so we use defaults
  const strategyName = DEFAULT_STRATEGY.name;
  const strategyTip =
    STRATEGY_TIPS[strategyName]?.tip ?? DEFAULT_STRATEGY.tip;
  const strategyIcon = DEFAULT_STRATEGY.icon;

  // Personal best from card
  const personalBest = card?.personal_best ?? "-";

  // Task title
  const title = card?.task_name ?? "Fokus Belajar";

  const handleFinish = () => {
    router.push(`/task/${id}/reflection`);
  };

  // Loading state
  if (loading && !card) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Not-found state — still allow focus mode with defaults
  // (no hard block since focus mode can work without server data)

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
            {title}
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
          strategy={strategyName}
          tip={strategyTip}
          icon={strategyIcon}
        />

        <FocusTimer personalBest={personalBest} />

        <FocusSubtaskList initialSubtasks={subtasks} />

        <MindParking />

      </main>

      {/* Footer CTA */}
      <footer className="shrink-0 pb-[34px] pt-4 px-6 bg-white border-t border-neutral-100 z-50">
        <button
          onClick={handleFinish}
          className="w-full h-[56px] bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-base flex items-center justify-center gap-2.5 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all group"
        >
          <SquareCheckBig className="w-5 h-5 group-active:scale-110 transition-transform" />
          Selesai & Beri Refleksi
        </button>
      </footer>
    </div>
  );
}

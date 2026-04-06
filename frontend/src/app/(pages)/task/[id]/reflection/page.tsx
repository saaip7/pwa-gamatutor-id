"use client";

import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ReflectionSummary } from "@/components/feature/task/reflection/ReflectionSummary";
import { ReflectionForm } from "@/components/feature/task/reflection/ReflectionForm";
import { SettingsHeader } from "@/components/feature/settings/SettingsHeader";
import { CelebrationDialog } from "@/components/feature/task/reflection/CelebrationDialog";
import { useBoardStore } from "@/stores/board";
import { useGoalsStore } from "@/stores/goals";

export default function GuidedReflectionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [showSuccess, setShowSuccess] = React.useState(false);

  // Stores
  const tasks = useBoardStore((s) => s.tasks);
  const boardLoading = useBoardStore((s) => s.loading);
  const fetchBoard = useBoardStore((s) => s.fetchBoard);
  const generalGoal = useGoalsStore((s) => s.generalGoal);
  const fetchGoals = useGoalsStore((s) => s.fetchGoals);

  const card = tasks[id] ?? null;

  // Fetch data if empty (deep-linked)
  useEffect(() => {
    if (Object.keys(tasks).length === 0) {
      fetchBoard();
    }
    if (!generalGoal) {
      fetchGoals();
    }
  }, [tasks, generalGoal, fetchBoard, fetchGoals]);

  // Duration — in a real flow this would come from the study session just completed.
  // For now, use a placeholder since there's no active session tracking in the stores yet.
  const duration = "00:00:00";

  // Subtask counts from BoardCard
  const totalSubtasks = card?.subtasks?.length ?? 0;
  const subtasksCompleted = card?.subtasks?.filter((s) => s.isCompleted).length ?? 0;

  // Strategy — BoardCard has no strategy field; use a default
  const strategyName = "Fokus Mandiri";

  // Main goal from goals store
  const mainGoal = generalGoal
    ? `${generalGoal.textPre} ${generalGoal.textHighlight}`.trim()
    : card?.task_name ?? "Belajar";

  const handleFinish = () => {
    setShowSuccess(true);
  };

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  // Loading state
  if (boardLoading && !card) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col mx-auto bg-white relative overflow-hidden max-w-md">
      <SettingsHeader title="Guided Reflection" />

      <main className="flex-1 overflow-y-auto no-scrollbar pt-4">
        <ReflectionSummary
          duration={duration}
          subtasksCompleted={subtasksCompleted}
          totalSubtasks={totalSubtasks}
        />

        <div className="px-6 py-4 mt-4">
          <ReflectionForm
            strategyName={strategyName}
            mainGoal={mainGoal}
          />
        </div>
      </main>

      {/* Footer CTA */}
      <footer className="shrink-0 p-6 bg-white border-t border-neutral-100 z-50">
        <button
          onClick={handleFinish}
          className="w-full h-[56px] bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-base flex items-center justify-center gap-2.5 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all animate-pulse-slow"
        >
          <CheckCircle className="w-5 h-5" />
          Simpan & Selesaikan Tugas
        </button>
      </footer>

      <CelebrationDialog
        isOpen={showSuccess}
        onConfirm={goToDashboard}
        duration={duration}
        confidence="Sangat Yakin"
      />
    </div>
  );
}

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { ReflectionSummary } from "@/components/feature/task/reflection/ReflectionSummary";
import {
  ReflectionForm,
  ReflectionData,
} from "@/components/feature/task/reflection/ReflectionForm";
import { CelebrationDialog } from "@/components/feature/task/reflection/CelebrationDialog";
import { SettingsHeader } from "@/components/feature/settings/SettingsHeader";
import { useBoardStore } from "@/stores/board";
import { useGoalsStore } from "@/stores/goals";
import type { BoardCard } from "@/types";

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
}

export default function GuidedReflectionPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const durationSec = parseInt(searchParams.get("duration") || "0", 10);

  const [showSuccess, setShowSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [card, setCard] = useState<BoardCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [reflectionData, setReflectionData] = useState<ReflectionData | null>(null);

  // Stores
  const fetchCardDetail = useBoardStore((s) => s.fetchCardDetail);
  const updateCard = useBoardStore((s) => s.updateCard);
  const moveCard = useBoardStore((s) => s.moveCard);
  const generalGoal = useGoalsStore((s) => s.generalGoal);
  const fetchGoals = useGoalsStore((s) => s.fetchGoals);

  // Fetch card detail
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchCardDetail(id)
      .then((data) => setCard(data))
      .catch(() => setCard(null))
      .finally(() => setLoading(false));
  }, [id, fetchCardDetail]);

  // Fetch goals
  useEffect(() => {
    if (!generalGoal) fetchGoals();
  }, [generalGoal, fetchGoals]);

  // Subtask counts from card checklists
  const checklists = card?.checklists || [];
  const totalSubtasks = checklists.length;
  const subtasksCompleted = checklists.filter((s) => s.isCompleted).length;

  // Strategy from card
  const strategyName = card?.learning_strategy || "Fokus Mandiri";

  // Main goal from goals store
  const mainGoal = generalGoal
    ? `${generalGoal.textPre} ${generalGoal.textHighlight}`.trim()
    : card?.task_name ?? "Belajar";

  // Duration display
  const duration = formatDuration(durationSec);

  // Confidence label for celebration dialog
  const confidenceLabel = (() => {
    const c = reflectionData?.q2_confidence;
    if (!c) return "Cukup Yakin";
    if (c <= 2) return "Masih Ragu";
    if (c <= 3) return "Cukup Yakin";
    if (c <= 4) return "Yakin";
    return "Sangat Yakin";
  })();

  const handleReflectionChange = useCallback((data: ReflectionData) => {
    setReflectionData(data);
  }, []);

  const handleFinish = async () => {
    if (!card || !reflectionData) return;
    setSaving(true);

    try {
      // 1. Save reflection + goal_check to card
      const reflectionPayload = {
        q1_strategy: reflectionData.q1_strategy,
        q2_confidence: reflectionData.q2_confidence,
        q3_improvement: reflectionData.q3_improvement,
        q4_value: reflectionData.q4_value,
        completed_at: new Date().toISOString(),
      };

      const goalCheckPayload = card.goal_check?.goal_text
        ? { ...card.goal_check, helpful: reflectionData.q4_value === "ya" }
        : undefined;

      await updateCard(id, {
        reflection: reflectionPayload as BoardCard["reflection"],
        ...(goalCheckPayload ? { goal_check: goalCheckPayload } : {}),
      });

      // 2. Move card to reflection column (list4)
      await moveCard(id, "reflection");

      setShowSuccess(true);
    } catch {
      // Error handled in stores/api
    } finally {
      setSaving(false);
    }
  };

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white max-w-md mx-auto">
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
            onChange={handleReflectionChange}
          />
        </div>
      </main>

      {/* Footer CTA */}
      <footer className="shrink-0 p-6 bg-white border-t border-neutral-100 z-50">
        <button
          onClick={handleFinish}
          disabled={saving}
          className="w-full h-[56px] bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-base flex items-center justify-center gap-2.5 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <CheckCircle className="w-5 h-5" />
          )}
          {saving ? "Menyimpan..." : "Simpan & Selesaikan Tugas"}
        </button>
      </footer>

      <CelebrationDialog
        isOpen={showSuccess}
        onConfirm={goToDashboard}
        duration={duration}
        confidence={confidenceLabel}
      />
    </div>
  );
}

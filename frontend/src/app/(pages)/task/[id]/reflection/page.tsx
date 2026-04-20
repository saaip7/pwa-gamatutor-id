"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { ReflectionSummary } from "@/components/feature/task/reflection/ReflectionSummary";
import {
  ReflectionForm,
  ReflectionData,
} from "@/components/feature/task/reflection/ReflectionForm";
import { CelebrationDialog } from "@/components/feature/task/reflection/CelebrationDialog";
import { SettingsHeader } from "@/components/feature/settings/SettingsHeader";
import { Drawer } from "@/components/ui/Drawer";
import { useBoardStore } from "@/stores/board";
import { useFocusSessionStore } from "@/stores/focusSession";
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
  const [goalsLoaded, setGoalsLoaded] = useState(false);
  const [reflectionData, setReflectionData] = useState<ReflectionData | null>(null);
  const [formValid, setFormValid] = useState(false);
  const [showBackDrawer, setShowBackDrawer] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const submittedRef = useRef(false);

  // Stores
  const fetchCardDetail = useBoardStore((s) => s.fetchCardDetail);
  const updateCard = useBoardStore((s) => s.updateCard);
  const moveCard = useBoardStore((s) => s.moveCard);
  const generalGoal = useGoalsStore((s) => s.generalGoal);
  const fetchGoals = useGoalsStore((s) => s.fetchGoals);
  const pendingReflection = useFocusSessionStore((s) => s.pendingReflection);
  const clearPendingReflection = useFocusSessionStore((s) => s.clearPendingReflection);

  // Use duration from store if available (for resume scenario), fallback to URL param
  const effectiveDuration = pendingReflection?.cardId === id
    ? pendingReflection.duration
    : durationSec;

  // Fetch card detail
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchCardDetail(id)
      .then((data) => setCard(data))
      .catch(() => setCard(null))
      .finally(() => setLoading(false));
  }, [id, fetchCardDetail]);

  // Fetch goals (track loading)
  useEffect(() => {
    fetchGoals().finally(() => setGoalsLoaded(true));
  }, [fetchGoals]);

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
  const duration = formatDuration(effectiveDuration);

  // Confidence label for celebration dialog
  const confidenceLabel = (() => {
    const c = reflectionData?.q2_confidence;
    if (!c) return "Cukup Yakin";
    if (c <= 2) return "Masih Ragu";
    if (c <= 3) return "Cukup Yakin";
    if (c <= 4) return "Yakin";
    return "Sangat Yakin";
  })();

  const handleReflectionChange = useCallback((data: ReflectionData, isValid: boolean) => {
    setReflectionData(data);
    setFormValid(isValid);
  }, []);

  // Submit reflection
  const handleFinish = async () => {
    if (!card || !reflectionData || !formValid || submittedRef.current) return;
    submittedRef.current = true;
    setSaving(true);

    try {
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

      // Move card to reflection column
      await moveCard(id, "reflection");

      clearPendingReflection();
      setShowSuccess(true);
    } catch {
      toast.error("Gagal menyimpan refleksi. Coba lagi.");
      submittedRef.current = false;
    } finally {
      setSaving(false);
    }
  };

  // Leave without submitting → move card to controlling
  const handleLeaveReflection = async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    try {
      await moveCard(id, "controlling");
    } catch {
      // Card might already be in controlling, ignore
    }

    // Keep pendingReflection alive so user can resume from task detail
    router.push("/board");
  };

  // Archive the card directly from reflection
  const handleArchive = async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setArchiving(true);

    try {
      await updateCard(id, { archived: true });
    } catch {
      toast.error("Gagal mengarsipkan tugas");
      submittedRef.current = false;
      setArchiving(false);
      return;
    }

    clearPendingReflection();
    router.push("/board");
  };

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  // Loading state — wait for both card and goals
  if (loading || !goalsLoaded) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white max-w-md mx-auto">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col mx-auto bg-white relative overflow-hidden max-w-md">
      {/* Header with back button */}
      <header className="shrink-0 pt-14 pb-3 px-5 border-b border-neutral-100 flex items-center gap-3 bg-white z-50">
        <button
          onClick={() => setShowBackDrawer(true)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-50 border border-neutral-100 text-neutral-600 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-neutral-900">Guided Reflection</h1>
      </header>

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
        {!formValid && (
          <p className="text-[11px] text-neutral-500 text-center font-bold mb-3 flex items-center justify-center gap-1.5 bg-amber-50 py-2 rounded-lg border border-amber-100/50">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            Jawab 3 pertanyaan di atas untuk melanjutkan
          </p>
        )}
        <button
          onClick={handleFinish}
          disabled={saving || !formValid}
          className="w-full h-[56px] bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-base flex items-center justify-center gap-2.5 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
        mainGoal={mainGoal}
        tasksCompleted={0}
      />

      {/* Back Confirmation Drawer */}
      <Drawer
        isOpen={showBackDrawer}
        onClose={() => setShowBackDrawer(false)}
        title="Keluar dari Refleksi?"
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800">
                Refleksi belum disimpan
              </p>
              <p className="text-xs text-amber-600 mt-1 font-medium leading-relaxed">
                Pilih tindakan di bawah untuk melanjutkan.
              </p>
            </div>
          </div>

          <button
            onClick={handleLeaveReflection}
            className="w-full py-4 bg-white border border-neutral-200 text-neutral-700 rounded-2xl font-bold text-sm active:scale-95 transition-all"
          >
            Pindah ke Controlling
          </button>

          <button
            onClick={handleArchive}
            disabled={archiving}
            className="w-full py-4 bg-neutral-100 text-neutral-500 rounded-2xl font-bold text-sm active:scale-95 transition-all disabled:opacity-50"
          >
            {archiving ? "Mengarsipkan..." : "Arsipkan Tugas"}
          </button>

          <button
            onClick={() => setShowBackDrawer(false)}
            className="w-full py-3 text-sm font-bold text-primary active:scale-95 transition-all"
          >
            Batal
          </button>
        </div>
      </Drawer>
    </div>
  );
}

"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ReflectionSummary } from "@/components/feature/task/reflection/ReflectionSummary";
import { ReflectionForm } from "@/components/feature/task/reflection/ReflectionForm";
import { SettingsHeader } from "@/components/feature/settings/SettingsHeader";
import { CelebrationDialog } from "@/components/feature/task/reflection/CelebrationDialog";

// Mock Data for Slicing
const MOCK_DATA = {
  duration: "00:45:12",
  subtasksCompleted: 3,
  totalSubtasks: 3,
  strategy: "Video Tutorial",
  mainGoal: "Belajar Sorting Algo"
};

export default function GuidedReflectionPage() {
  const router = useRouter();
  const params = useParams();
  const [showSuccess, setShowSuccess] = React.useState(false);

  const handleFinish = () => {
    setShowSuccess(true);
  };

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="w-full h-screen flex flex-col mx-auto bg-white relative overflow-hidden max-w-md">
      <SettingsHeader title="Guided Reflection" />

      <main className="flex-1 overflow-y-auto no-scrollbar pt-4">
        <ReflectionSummary 
          duration={MOCK_DATA.duration} 
          subtasksCompleted={MOCK_DATA.subtasksCompleted} 
          totalSubtasks={MOCK_DATA.totalSubtasks} 
        />

        <div className="px-6 py-4 mt-4">
          <ReflectionForm 
            strategyName={MOCK_DATA.strategy} 
            mainGoal={MOCK_DATA.mainGoal} 
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
        duration={MOCK_DATA.duration}
        confidence="Sangat Yakin"
      />
    </div>
  );
}

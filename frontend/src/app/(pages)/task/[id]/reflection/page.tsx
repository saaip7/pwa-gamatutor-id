"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ReflectionSummary } from "@/components/feature/task/reflection/ReflectionSummary";
import { ReflectionForm } from "@/components/feature/task/reflection/ReflectionForm";
import { SettingsHeader } from "@/components/feature/settings/SettingsHeader";

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
          className="w-full h-[56px] bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-[15px] flex items-center justify-center gap-2.5 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all animate-pulse-slow"
        >
          <CheckCircle className="w-5 h-5" />
          Simpan & Selesaikan Tugas
        </button>
      </footer>

      {/* Success Dialog Popup (Placeholder) */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
              onClick={goToDashboard}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[32px] p-8 w-full max-w-xs text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                🎉
              </div>
              <h3 className="text-xl font-black text-neutral-900 mb-2">Luar Biasa!</h3>
              <p className="text-sm text-neutral-500 leading-relaxed mb-8">
                Refleksi kamu telah disimpan. Satu langkah lebih dekat menuju targetmu!
              </p>
              <button 
                onClick={goToDashboard}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold active:scale-95 transition-transform shadow-lg shadow-primary/20"
              >
                Kembali ke Home
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

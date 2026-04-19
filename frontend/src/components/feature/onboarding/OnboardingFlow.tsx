"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Step1Welcome } from "./Step1Welcome";
import { Step2GoalSetting } from "./Step2GoalSetting";
import { Step3FeatureIntro } from "./Step3FeatureIntro";
import { api } from "@/lib/api";

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState("");

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleGoalSubmit = (selectedGoal: string) => {
    setGoal(selectedGoal);
    // Save general goal to BE in background
    api.put("/api/goals/general", {
      textPre: "Aku ingin ",
      textHighlight: selectedGoal,
    }).catch(() => {
      // Silent fail — will retry later
    });
    handleNext();
  };

  const handleComplete = () => {
    router.push("/onboarding/guide");
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col font-sans text-neutral-800 relative overflow-hidden">
      {/* Shared Background Blobs */}
      <div className="absolute top-[-5%] left-[-10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none z-0"></div>

      {/* Shared Header with Progress Indicators */}
      <header className="shrink-0 pt-14 px-6 pb-2 z-20 relative flex items-center justify-between bg-white/50 backdrop-blur-sm">
        {step === 1 ? (
          <div className="w-10" />
        ) : (
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:text-neutral-800 bg-neutral-50 hover:bg-neutral-200 rounded-full transition-colors border border-neutral-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-neutral-500">Step {step} of 3</span>
          <div className="flex gap-1.5">
            <div className={`w-2 h-2 rounded-full ${step >= 1 ? "bg-primary" : "bg-neutral-200"}`}></div>
            <div className={`w-2 h-2 rounded-full ${step >= 2 ? "bg-primary" : "bg-neutral-200"}`}></div>
            <div className={`w-2 h-2 rounded-full ${step >= 3 ? "bg-primary" : "bg-neutral-200"}`}></div>
          </div>
        </div>
      </header>

      {/* Main Content Area with Transitions */}
      <main className="flex-1 overflow-y-auto relative z-10 flex flex-col">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              className="flex-1 flex flex-col px-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Step1Welcome onNext={handleNext} />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              className="flex-1 flex flex-col px-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Step2GoalSetting onNext={handleGoalSubmit} />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              className="flex-1 flex flex-col px-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Step3FeatureIntro onComplete={handleComplete} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

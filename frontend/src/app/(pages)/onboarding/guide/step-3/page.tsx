"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Joyride, STATUS } from "react-joyride";
import { ArrowLeft } from "lucide-react";
import { ReflectionSummary } from "@/components/feature/task/reflection/ReflectionSummary";
import { ReflectionForm, ReflectionData } from "@/components/feature/task/reflection/ReflectionForm";

const steps = [
  {
    target: "#guide-reflection-form",
    content: "Jawab 3 pertanyaan refleksi ini untuk mengevaluasi proses belajarmu. Ini membantu kamu belajar lebih efektif.",
    disableBeacon: true,
  },
  {
    target: "#guide-reflection-submit",
    content: "Setelah dijawab, tugas berpindah ke kolom Reflection dan progressmu tercatat.",
    disableBeacon: true,
  },
];

export default function GuideStep3Page() {
  const router = useRouter();
  const [run] = useState(true);
  const [, setReflectionValid] = useState(false);

  const handleReflectionChange = useCallback((_data: ReflectionData, isValid: boolean) => {
    setReflectionValid(isValid);
  }, []);

  const handleJoyrideCallback = (data: { status: string }) => {
    if (data.status === STATUS.FINISHED) {
      router.push("/onboarding/guide/step-4");
    }
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col font-sans text-neutral-800 overflow-hidden max-w-md mx-auto relative">
      {/* Progress bar */}
      <div className="shrink-0 pt-3 px-5 sticky top-0 bg-white z-40">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Langkah 3 dari 5</span>
          <span className="text-[10px] font-bold text-primary">60%</span>
        </div>
        <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: "60%" }} />
        </div>
      </div>

      {/* Header */}
      <div className="shrink-0 pt-3 pb-3 px-5 border-b border-neutral-100 flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-50 border border-neutral-100">
          <ArrowLeft className="w-5 h-5 text-neutral-500" />
        </div>
        <span className="text-sm font-bold text-neutral-800">Refleksi</span>
      </div>

      {/* Reflection Summary — actual component */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <ReflectionSummary duration="25:00" subtasksCompleted={1} totalSubtasks={4} />

        {/* Reflection Form — actual component */}
        <div id="guide-reflection-form" className="px-6 py-4">
          <ReflectionForm
            strategyName="Pomodoro Technique"
            mainGoal="Lulus dengan IPK 3.5"
            onChange={handleReflectionChange}
          />
        </div>

        {/* Submit */}
        <div className="px-6 pb-10">
          <button id="guide-reflection-submit" className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-[0_4px_16px_rgba(59,130,246,0.3)]">
            Simpan &amp; Selesaikan Tugas
          </button>
        </div>
      </div>

      {/* Joyride */}
      <Joyride
        run={run}
        steps={steps}
        continuous={true}
        options={{
          showProgress: true,
          primaryColor: "#3b82f6",
          backgroundColor: "#ffffff",
          textColor: "#262626",
          arrowColor: "#ffffff",
          skipBeacon: true,
          width: 320,
        }}
        styles={{
          tooltipContainer: { textAlign: "left" },
          buttonPrimary: { background: "#3b82f6" },
        }}
        locale={{ last: "Selesai" }}
        onEvent={handleJoyrideCallback}
      />
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Joyride, STATUS } from "react-joyride";
import { ArrowLeft, Minimize2, BookOpen } from "lucide-react";
import { FocusTimer } from "@/components/feature/task/focus/FocusTimer";
import { FocusStrategyTip } from "@/components/feature/task/focus/FocusStrategyTip";
import { Lightbulb } from "lucide-react";

const steps = [
  {
    target: "#guide-focus-task-header",
    content: "Ini halaman Focus Mode. Di sini kamu belajar dengan timer fokus tanpa distraksi.",
    disableBeacon: true,
  },
  {
    target: "#guide-focus-strategy-tip",
    content: "Strategi belajar ditampilkan sebagai tips agar sesi belajarmu lebih efektif.",
    disableBeacon: true,
  },
  {
    target: "#guide-focus-timer",
    content: "Timer berjalan selama kamu belajar. Waktu tercatat otomatis sebagai personal best.",
    disableBeacon: true,
  },
  {
    target: "#guide-focus-end-button",
    content: "Setelah selesai, tap tombol ini untuk menyimpan sesi dan mengisi refleksi.",
    disableBeacon: true,
  },
  {
    target: "#guide-focus-pause-button",
    content: "Perlu jeda? Tap tombol ini untuk pause sesi dan lanjut nanti.",
    disableBeacon: true,
  },
];

export default function GuideStep2Page() {
  const router = useRouter();
  const [run] = useState(true);

  const handleJoyrideCallback = (data: { status: string }) => {
    if (data.status === STATUS.FINISHED) {
      router.push("/onboarding/guide/step-3");
    }
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col font-sans text-neutral-800 relative overflow-hidden max-w-md mx-auto">
      {/* Progress bar */}
      <div className="shrink-0 pt-3 px-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Langkah 2 dari 5</span>
          <span className="text-[10px] font-bold text-primary">40%</span>
        </div>
        <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: "40%" }} />
        </div>
      </div>

      {/* Focus Mode Header — same structure as real focus page */}
      <div id="guide-focus-task-header" className="shrink-0 px-4 pt-3 pb-2 border-b border-neutral-100 flex items-center justify-between">
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-50 border border-neutral-100">
          <ArrowLeft className="w-5 h-5 text-neutral-500" />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-sm font-bold text-neutral-800 truncate px-2">Tugas Klasifikasi</h1>
          <p className="text-[10px] text-neutral-400 font-medium">IF-302 Machine Learning</p>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-50 border border-neutral-100">
          <Minimize2 className="w-4 h-4 text-neutral-500" />
        </button>
      </div>

      {/* Strategy Tip — actual component */}
      <div className="px-5 pt-4">
        <div id="guide-focus-strategy-tip">
          <FocusStrategyTip
            strategy="Pomodoro Technique"
            tip="Kerjakan tugas dalam blok 25 menit, lalu istirahat 5 menit. Setelah 4 blok, istirahat lebih lama 15-30 menit."
            icon={Lightbulb}
          />
        </div>
      </div>

      {/* Timer — actual component */}
      <div id="guide-focus-timer" className="flex-1 flex flex-col items-center justify-center">
        <FocusTimer personalBest="25:00" startTime={Date.now()} />
      </div>

      {/* Action Buttons — same structure as real focus page */}
      <div className="shrink-0 px-5 pb-10 pt-4 space-y-3">
        <button id="guide-focus-end-button" className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary-hover active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(59,130,246,0.3)]">
          Selesai &amp; Beri Refleksi
        </button>
        <button id="guide-focus-pause-button" className="w-full py-4 bg-white border border-neutral-200 text-neutral-700 rounded-2xl font-bold text-sm hover:bg-neutral-50 active:scale-[0.98] transition-all">
          Jeda &amp; Sesuaikan
        </button>
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

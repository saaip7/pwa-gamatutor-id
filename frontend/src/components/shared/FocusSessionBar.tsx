"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Pause, ChevronRight } from "lucide-react";
import { useFocusSessionStore } from "@/stores/focusSession";

function formatTimer(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function FocusSessionBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isActive, cardId, taskName, startTime } = useFocusSessionStore();
  const [elapsed, setElapsed] = useState(0);

  // Hide on focus page itself
  const isOnFocusPage = pathname.includes("/focus");

  // Update timer every second using wall clock
  useEffect(() => {
    if (!isActive) return;

    const update = () => setElapsed(Date.now() - startTime);
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  if (!isActive || isOnFocusPage) return null;

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+80px)] left-0 right-0 z-50 px-4 pb-2 max-w-md mx-auto">
      <button
        onClick={() => router.push(`/task/${cardId}/focus`)}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-primary rounded-2xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all"
      >
        {/* Animated pulse indicator */}
        <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
          <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
          <Pause className="w-4 h-4 text-white relative z-10" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-bold text-white/70 uppercase tracking-wider">
            Sesi Fokus Aktif
          </p>
          <p className="text-sm font-black text-white truncate">
            {taskName}
          </p>
        </div>

        {/* Timer */}
        <div className="shrink-0 text-right">
          <p className="text-lg font-black text-white tabular-nums tracking-tight">
            {formatTimer(elapsed)}
          </p>
        </div>

        <ChevronRight className="w-4 h-4 text-white/60 shrink-0" />
      </button>
    </div>
  );
}

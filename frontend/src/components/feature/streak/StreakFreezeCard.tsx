"use client";

import React from "react";
import { ShieldCheck, Snowflake } from "lucide-react";

interface StreakFreezeCardProps {
  available: number;
  onUse: () => void;
}

export function StreakFreezeCard({ available, onUse }: StreakFreezeCardProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100/50">
            <ShieldCheck className="w-[18px] h-[18px]" />
          </div>
          <h3 className="text-base font-bold text-neutral-900 leading-tight">Pelindung Streak</h3>
        </div>
        <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg flex items-center justify-center min-w-[36px]">
          <span className="text-sm font-bold leading-none">{available}</span>
        </div>
      </div>
      <button
        onClick={onUse}
        disabled={available <= 0}
        className="w-full h-10 bg-white border border-neutral-200 shadow-sm text-sm font-semibold text-neutral-700 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 active:bg-neutral-100 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Snowflake className="w-4 h-4 text-neutral-400" />
        Gunakan Hari Ini
      </button>
    </div>
  );
}

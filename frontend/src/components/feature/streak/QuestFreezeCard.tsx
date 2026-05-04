"use client";

import React from "react";
import { Snowflake, Scroll, Loader2 } from "lucide-react";

interface QuestFreezeCardProps {
  available: number;
  onUse: () => void;
  loading?: boolean;
}

export function QuestFreezeCard({ available, onUse, loading }: QuestFreezeCardProps) {
  const hasFreeze = available > 0;

  return (
    <div className={`rounded-2xl overflow-hidden ${hasFreeze ? "bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100/60" : "bg-neutral-50 border border-neutral-200"}`}>
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              hasFreeze
                ? "bg-violet-100 text-violet-500"
                : "bg-neutral-100 text-neutral-400"
            }`}>
              <Scroll className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-neutral-900 leading-tight">Quest Freeze</h3>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {hasFreeze
                  ? `Dari quest — pakai kapan saja`
                  : "Selesaikan quest untuk mendapat freeze"}
              </p>
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-lg flex items-center justify-center min-w-[32px] ${
            hasFreeze ? "bg-violet-500 text-white" : "bg-neutral-200 text-neutral-500"
          }`}>
            <span className="text-xs font-bold leading-none">{available}</span>
          </div>
        </div>
      </div>

      <div className="px-5 pb-4">
        <button
          onClick={onUse}
          disabled={!hasFreeze || loading}
          className={`w-full h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            hasFreeze
              ? "bg-violet-500 text-white hover:bg-violet-600 shadow-sm"
              : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Menggunakan...
            </>
          ) : (
            <>
              <Snowflake className="w-4 h-4" />
              {hasFreeze ? "Gunakan Quest Freeze" : "Belum tersedia"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { ShieldCheck, Snowflake, Loader2 } from "lucide-react";

interface StreakFreezeCardProps {
  available: number;
  onUse: () => void;
  loading?: boolean;
}

export function StreakFreezeCard({ available, onUse, loading }: StreakFreezeCardProps) {
  const hasFreeze = available > 0;

  return (
    <div className={`rounded-2xl overflow-hidden ${hasFreeze ? "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/60" : "bg-neutral-50 border border-neutral-200"}`}>
      {/* Top section */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              hasFreeze
                ? "bg-blue-100 text-blue-500"
                : "bg-neutral-100 text-neutral-400"
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-neutral-900 leading-tight">Pelindung Streak</h3>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {hasFreeze ? "Proteksi 1x/minggu saat tidak aktif" : "Kuota minggu ini sudah habis"}
              </p>
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-lg flex items-center justify-center min-w-[32px] ${
            hasFreeze ? "bg-blue-500 text-white" : "bg-neutral-200 text-neutral-500"
          }`}>
            <span className="text-xs font-bold leading-none">{available}</span>
          </div>
        </div>
      </div>

      {/* Button */}
      <div className="px-5 pb-4">
        <button
          onClick={onUse}
          disabled={!hasFreeze || loading}
          className={`w-full h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            hasFreeze
              ? "bg-blue-500 text-white hover:bg-blue-600 shadow-sm"
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
              Gunakan Hari Ini
            </>
          )}
        </button>
      </div>
    </div>
  );
}

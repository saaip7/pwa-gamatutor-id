import React from "react";
import { SlidersHorizontal } from "lucide-react";

export function GoalsHeader() {
  return (
    <header className="shrink-0 pt-14 px-6 pb-4 flex items-center justify-between bg-white z-10 sticky top-0">
      <h1 className="text-2xl font-bold text-neutral-800 tracking-tight">Goals</h1>
      <div className="flex gap-3">
        <button 
          type="button" 
          className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-50 border border-neutral-200 text-neutral-600 hover:bg-neutral-100 transition-colors active:scale-95"
          aria-label="Filter goals"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

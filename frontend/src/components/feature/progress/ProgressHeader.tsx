import React from "react";
import { Share2 } from "lucide-react";

export function ProgressHeader() {
  return (
    <header className="shrink-0 pt-14 px-6 pb-2 flex items-center justify-between relative z-10">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800 tracking-tight">Progress</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Track your learning journey</p>
      </div>
      <button 
        type="button" 
        className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-800 hover:bg-neutral-100 transition-colors active:scale-95"
        aria-label="Share progress"
      >
        <Share2 className="w-5 h-5" />
      </button>
    </header>
  );
}

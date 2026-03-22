"use client";

import React from "react";
import { Play, Trash2, Edit3, Lightbulb } from "lucide-react";
import Link from "next/link";

interface TaskDetailActionBarProps {
  taskId: string;
  status: string;
}

export function TaskDetailActionBar({ taskId, status }: TaskDetailActionBarProps) {
  const isPlanning = status.toLowerCase() === "planning";

  return (
    <footer className="shrink-0 pb-[34px] pt-4 px-6 bg-white border-t border-neutral-100 flex flex-col">
      {isPlanning && (
        <p className="text-[11px] text-neutral-500 text-center font-bold mb-4 flex items-center justify-center gap-1.5 bg-amber-50 py-2 rounded-lg border border-amber-100/50">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          Pindahkan ke Monitoring untuk mulai belajar.
        </p>
      )}
      
      <div className="flex items-center gap-3">
        <Link 
          href={`/task/${taskId}/edit`}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-600 active:scale-95 transition-all shrink-0"
        >
          <Edit3 className="w-5 h-5" />
        </Link>
        
        <button 
          disabled={isPlanning}
          className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-[15px] transition-all active:scale-[0.98] shadow-lg ${
            isPlanning 
              ? "bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200" 
              : "bg-primary text-white shadow-primary/20"
          }`}
        >
          <Play className="w-5 h-5 fill-current" />
          Mulai Sesi Fokus
        </button>
        
        <button 
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-50 border border-red-100 text-red-500 active:scale-95 transition-all shrink-0"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </footer>
  );
}

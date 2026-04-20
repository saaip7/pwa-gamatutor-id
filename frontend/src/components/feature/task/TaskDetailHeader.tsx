"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MoreVertical } from "lucide-react";

export function TaskDetailHeader() {
  const router = useRouter();

  return (
    <header className="shrink-0 pt-14 pb-4 px-6 border-b border-neutral-100 flex items-center justify-between bg-white z-50">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-700 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-neutral-900">Detail Tugas</h1>
      </div>
      <button className="w-10 h-10 flex items-center justify-center text-neutral-400 active:bg-neutral-50 rounded-xl transition-colors">
        <MoreVertical className="w-5 h-5" />
      </button>
    </header>
  );
}

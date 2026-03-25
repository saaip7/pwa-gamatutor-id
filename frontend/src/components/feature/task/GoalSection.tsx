"use client";

import React from "react";
import { Lightbulb } from "lucide-react";

interface GoalSectionProps {
  goal: string;
}

export function GoalSection({ goal }: GoalSectionProps) {
  return (
    <div className="bg-blue-50/40 border border-blue-100/60 p-5 rounded-2xl shadow-sm">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 shadow-sm">
          <Lightbulb className="w-4.5 h-4.5" />
        </div>
        <h3 className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider">
          Kenapa Tugas Ini Penting?
        </h3>
      </div>
      <p className="text-[14px] text-neutral-700 leading-relaxed font-medium pl-1">
        {goal}
      </p>
    </div>
  );
}

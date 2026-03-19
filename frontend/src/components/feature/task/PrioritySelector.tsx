"use client";

import React from "react";
import { Zap, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type PriorityLevel = "Low" | "Medium" | "High";

interface PrioritySelectorProps {
  value: PriorityLevel;
  onChange: (value: PriorityLevel) => void;
}

const PRIORITIES: { id: PriorityLevel; label: string }[] = [
  { id: "Low", label: "Rendah" },
  { id: "Medium", label: "Sedang" },
  { id: "High", label: "Tinggi" },
];

export function PrioritySelector({ value, onChange }: PrioritySelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[14px] font-semibold text-neutral-900 flex items-center gap-2">
        <Zap className="w-[18px] h-[18px] text-neutral-500" /> 
        Prioritas <span className="text-error">*</span>
      </label>
      
      <div className="flex gap-2">
        {PRIORITIES.map((prio) => {
          const isSelected = value === prio.id;

          return (
            <button
              key={prio.id}
              type="button"
              onClick={() => onChange(prio.id)}
              className={cn(
                "flex-1 py-3.5 rounded-xl border transition-all shadow-sm relative flex flex-col items-center justify-center",
                isSelected
                  ? "border-2 border-primary bg-primary/5 text-primary font-bold"
                  : "border-neutral-200 bg-white text-neutral-600 active:bg-neutral-50"
              )}
            >
              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-white shadow-sm">
                  <Check className="w-[10px] h-[10px]" />
                </div>
              )}
              <span className="text-[13px] font-medium">{prio.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

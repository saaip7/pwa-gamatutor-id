"use client";

import React from "react";
import { Brain, Video, Pencil, BookOpenText, Users, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type LearningStrategy = "Video" | "Latihan" | "Baca" | "Diskusi";

interface StrategySelectorProps {
  value: LearningStrategy | "";
  onChange: (value: LearningStrategy) => void;
}

const STRATEGIES: { id: LearningStrategy; label: string; icon: any }[] = [
  { id: "Video", label: "Video", icon: Video },
  { id: "Latihan", label: "Latihan", icon: Pencil },
  { id: "Baca", label: "Baca", icon: BookOpenText },
  { id: "Diskusi", label: "Diskusi", icon: Users },
];

export function StrategySelector({ value, onChange }: StrategySelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[14px] font-semibold text-neutral-900 flex items-center gap-2">
        <Brain className="w-[18px] h-[18px] text-purple-500" /> 
        Strategi Belajar <span className="text-error">*</span>
      </label>
      
      <div className="grid grid-cols-2 gap-3">
        {STRATEGIES.map((strategy) => {
          const isSelected = value === strategy.id;
          const Icon = strategy.icon;

          return (
            <button
              key={strategy.id}
              type="button"
              onClick={() => onChange(strategy.id)}
              className={cn(
                "flex items-center justify-center gap-2 p-3.5 rounded-xl border transition-all shadow-sm relative",
                isSelected
                  ? "border-2 border-primary bg-primary/5 text-primary font-bold"
                  : "border-neutral-200 bg-white text-neutral-700 active:bg-neutral-50"
              )}
            >
              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-white shadow-sm">
                  <Check className="w-[10px] h-[10px]" />
                </div>
              )}
              <Icon className={cn("w-5 h-5", isSelected ? "text-primary" : "text-neutral-400")} />
              <span className="text-[13px] font-medium">{strategy.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

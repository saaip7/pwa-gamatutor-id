"use client";

import React from "react";
import { Check, Snowflake, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type DayState = "completed" | "freeze" | "inactive" | "today" | "future";

export interface StreakDay {
  label: string;
  state: DayState;
}

interface StreakCalendarProps {
  days: StreakDay[];
}

export function StreakCalendar({ days }: StreakCalendarProps) {
  return (
    <div className="flex justify-between items-center px-1">
      {days.map((day, i) => (
        <div key={i} className="flex flex-col items-center gap-2.5">
          {day.state === "completed" && (
            <div className="w-[42px] h-[42px] rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-[inset_0_0_0_1.5px_rgba(16,185,129,0.2)]">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
          )}
          {day.state === "freeze" && (
            <div className="w-[42px] h-[42px] rounded-full bg-blue-50 text-blue-400 flex items-center justify-center shadow-[inset_0_0_0_1.5px_rgba(96,165,250,0.3)] relative">
              <Snowflake className="w-5 h-5" />
            </div>
          )}
          {day.state === "inactive" && (
            <div className="w-[42px] h-[42px] rounded-full bg-red-50 text-red-300 flex items-center justify-center shadow-[inset_0_0_0_1.5px_rgba(248,113,113,0.2)]">
              <X className="w-4 h-4 stroke-[2.5]" />
            </div>
          )}
          {day.state === "today" && (
            <div className="relative flex flex-col items-center gap-2.5">
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md whitespace-nowrap">
                Hari ini
              </div>
              <div className="w-[42px] h-[42px] rounded-full bg-neutral-50 text-neutral-300 flex items-center justify-center border-2 border-dashed border-neutral-200">
                <div className="w-2 h-2 rounded-full bg-neutral-300" />
              </div>
            </div>
          )}
          {day.state === "future" && (
            <div className="opacity-40">
              <div className="w-[42px] h-[42px] rounded-full bg-neutral-50 flex items-center justify-center shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]" />
            </div>
          )}
          <span
            className={cn(
              "text-xs leading-none",
              day.state === "completed" ? "font-semibold text-emerald-600" :
              day.state === "freeze" ? "font-semibold text-blue-500" :
              day.state === "inactive" ? "font-semibold text-red-400" :
              day.state === "today" ? "font-bold text-neutral-900" :
              "font-medium text-neutral-400"
            )}
          >
            {day.label}
          </span>
        </div>
      ))}
    </div>
  );
}

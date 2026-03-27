"use client";

import React from "react";
import { Check, Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";

export type DayState = "completed" | "freeze" | "today" | "future";

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
            <div className="w-[42px] h-[42px] rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center shadow-sm border border-emerald-100/50">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
          )}
          {day.state === "freeze" && (
            <div className="w-[42px] h-[42px] rounded-full bg-blue-100 text-blue-500 flex items-center justify-center shadow-sm border border-blue-200 relative">
              <Snowflake className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
              </div>
            </div>
          )}
          {day.state === "today" && (
            <div className="relative flex flex-col items-center gap-2.5">
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md whitespace-nowrap">
                Hari ini
              </div>
              <div className="w-[42px] h-[42px] rounded-full bg-neutral-50 text-neutral-300 flex items-center justify-center border-2 border-dashed border-neutral-200 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-neutral-300" />
              </div>
            </div>
          )}
          {day.state === "future" && (
            <div className="opacity-60">
              <div className="w-[42px] h-[42px] rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-100" />
            </div>
          )}
          <span
            className={cn(
              "text-xs leading-none",
              day.state === "freeze" ? "font-semibold text-blue-600" :
              day.state === "today" ? "font-bold text-neutral-900" :
              day.state === "future" ? "font-medium text-neutral-400" :
              "font-semibold text-neutral-500"
            )}
          >
            {day.label}
          </span>
        </div>
      ))}
    </div>
  );
}

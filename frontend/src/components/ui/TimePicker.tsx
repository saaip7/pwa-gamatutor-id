"use client";

import React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  selectedTime: string; // Format "HH:mm"
  onSelect: (time: string) => void;
}

export function TimePicker({ selectedTime, onSelect }: TimePickerProps) {
  // Common time suggestions for quick picking
  const suggestions = ["08:00", "10:00", "13:00", "15:00", "19:00", "21:00"];

  return (
    <div className="flex flex-col gap-6 w-full py-2">
      <div className="flex flex-col gap-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
          Input Jam Spesifik
        </label>
        <div className="relative group">
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => onSelect(e.target.value)}
            className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-2xl px-5 py-4 text-2xl font-black text-neutral-900 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none"
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
            <Clock className="w-6 h-6 text-neutral-400 group-focus-within:text-primary transition-colors" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
          Saran Cepat
        </label>
        <div className="grid grid-cols-3 gap-3">
          {suggestions.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onSelect(t)}
              className={cn(
                "py-3.5 rounded-xl border-2 text-base font-bold transition-all active:scale-95",
                selectedTime === t 
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                  : "bg-white text-neutral-600 border-neutral-100 hover:border-primary/30"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

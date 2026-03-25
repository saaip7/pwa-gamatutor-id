"use client";

import React from "react";
import { Lightbulb, LucideIcon } from "lucide-react";

interface FocusStrategyTipProps {
  strategy: string;
  tip: string;
  icon: LucideIcon;
}

export function FocusStrategyTip({ strategy, tip, icon: Icon }: FocusStrategyTipProps) {
  return (
    <section className="flex flex-col items-center text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full border border-blue-100 shadow-sm">
        <Icon className="w-4 h-4" />
        <span className="text-[11px] font-black uppercase tracking-widest">Strategi: {strategy}</span>
      </div>
      <p className="mt-3 text-[13px] font-medium text-neutral-500 italic flex items-center gap-1.5 justify-center">
        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
        Tip: {tip}
      </p>
    </section>
  );
}

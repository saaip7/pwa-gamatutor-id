"use client";

import React from "react";
import { Check, Eye, Settings2, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type TaskStatus = "Planning" | "Monitoring" | "Controlling" | "Reflection";

interface TaskStatusStepperProps {
  currentStatus: TaskStatus;
  onUpdateStatus?: () => void;
}

export function TaskStatusStepper({ currentStatus, onUpdateStatus }: TaskStatusStepperProps) {
  const steps = [
    { id: "Planning", label: "Planning", icon: Check, activeColor: "bg-blue-500", lightColor: "bg-blue-50", textColor: "text-blue-600" },
    { id: "Monitoring", label: "Monitoring", icon: Eye, activeColor: "bg-amber-500", lightColor: "bg-amber-50", textColor: "text-amber-600" },
    { id: "Controlling", label: "Controlling", icon: Settings2, activeColor: "bg-purple-500", lightColor: "bg-purple-50", textColor: "text-purple-600" },
    { id: "Reflection", label: "Reflection", icon: Sparkles, activeColor: "bg-emerald-500", lightColor: "bg-emerald-50", textColor: "text-emerald-600" },
  ];

  const currentIndex = steps.findIndex(s => s.id === currentStatus);

  return (
    <section className="px-5 py-6 bg-white border-b border-neutral-100">
      <h2 className="text-[12px] font-black text-neutral-400 mb-6 uppercase tracking-widest">
        Status Saat Ini
      </h2>
      
      <div className="relative flex justify-between items-start px-2">
        {/* Background Connecting Line */}
        <div className="absolute top-4 left-8 right-8 h-[2px] bg-neutral-100 -z-0 rounded-full" />
        
        {/* Active Connecting Line */}
        <div 
          className="absolute top-4 left-8 h-[2px] bg-amber-400 transition-all duration-500 ease-in-out" 
          style={{ width: `${(currentIndex / (steps.length - 1)) * 85}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center gap-2.5 z-10 w-14">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
                isCompleted ? "bg-blue-50 border border-blue-200 text-blue-500" :
                isCurrent ? cn(step.activeColor, "border-2 border-white ring-4 ring-amber-50 text-white scale-110") :
                "bg-white border-2 border-neutral-100 text-neutral-300"
              )}>
                <StepIcon className={cn(isCurrent ? "w-4 h-4" : "w-3.5 h-3.5")} strokeWidth={3} />
              </div>
              <span className={cn(
                "text-[10px] font-bold tracking-tight transition-colors",
                isCurrent ? step.textColor : "text-neutral-400"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      <button 
        onClick={onUpdateStatus}
        className="mt-8 w-full py-3.5 rounded-2xl border border-neutral-200 bg-white text-sm font-bold text-neutral-700 flex items-center justify-center gap-2 hover:bg-neutral-50 active:scale-[0.98] transition-all shadow-sm"
      >
        Update Status 
        <ArrowRight className="w-4 h-4 text-neutral-400" />
      </button>
    </section>
  );
}

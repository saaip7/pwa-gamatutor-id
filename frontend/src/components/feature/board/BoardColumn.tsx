import React from "react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface BoardColumnProps {
  title: string;
  count: number;
  dotColorClass: string; // e.g. 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'
  badgeColorClass: string; // e.g. 'text-blue-700 bg-blue-100'
  children: React.ReactNode;
}

export function BoardColumn({ title, count, dotColorClass, badgeColorClass, children }: BoardColumnProps) {
  return (
    <section className="w-[85vw] max-w-[340px] shrink-0 snap-center h-full flex flex-col pt-5 px-3 sm:px-4">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2.5">
          <div className={cn("w-3 h-3 rounded-full", dotColorClass)}></div>
          <h2 className="font-semibold text-neutral-800 text-sm tracking-wide uppercase">{title}</h2>
          <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", badgeColorClass)}>
            {count}
          </span>
        </div>
        <button className="text-neutral-400 hover:text-neutral-600">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32 space-y-3 px-1">
        {children}
      </div>
    </section>
  );
}

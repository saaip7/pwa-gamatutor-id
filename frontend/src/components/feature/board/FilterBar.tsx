"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  filters: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function FilterBar({ filters, activeFilter, onFilterChange }: FilterBarProps) {
  return (
    <div className="shrink-0 py-3 pl-5 bg-white md:bg-neutral-50 border-b border-neutral-100 flex gap-2 overflow-x-auto no-scrollbar z-10">
      {filters.map((filter, index) => {
        const isActive = activeFilter === filter;
        const isLast = index === filters.length - 1;
        
        return (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={cn(
              "shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors active:scale-95",
              isActive 
                ? "bg-neutral-800 text-white shadow-sm" 
                : "bg-neutral-50 border border-neutral-200 text-neutral-600 hover:bg-neutral-100",
              isLast && "mr-5"
            )}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}

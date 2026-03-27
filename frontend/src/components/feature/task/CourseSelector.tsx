"use client";

import React from "react";
import { BookOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";

interface CourseSelectorProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
}

export function CourseSelector({ value, onChange, suggestions }: CourseSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="course" className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
        <BookOpen className="w-[18px] h-[18px] text-blue-500" /> 
        Mata Kuliah <span className="text-error">*</span>
      </label>
      
      <Input
        id="course"
        placeholder="Ketik atau pilih mata kuliah..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-4 pr-11"
        iconWrapper={
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
        }
      />
      
      <div className="flex flex-wrap gap-2 mt-1">
        {suggestions.map((course) => (
          <button
            key={course}
            type="button"
            onClick={() => onChange(course)}
            className="px-3.5 py-1.5 rounded-lg border border-neutral-200 text-xs font-medium text-neutral-700 bg-white shadow-sm active:bg-neutral-50 transition-colors"
          >
            {course}
          </button>
        ))}
      </div>
    </div>
  );
}

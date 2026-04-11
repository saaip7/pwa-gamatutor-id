"use client";

import React, { useEffect, useState, useRef } from "react";
import { BookOpen, Search, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface Course {
  _id: string;
  course_code: string;
  course_name: string;
}

interface CourseSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function CourseSelector({ value, onChange }: CourseSelectorProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api
      .get<Course[]>("/courses")
      .then((data) => setCourses(data))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Filter courses by query
  const filtered = courses.filter(
    (c) =>
      c.course_name.toLowerCase().includes(query.toLowerCase()) ||
      c.course_code.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (courseName: string) => {
    onChange(courseName);
    setQuery("");
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setIsOpen(true);
  };

  const handleFocus = () => {
    setIsOpen(true);
    // Clear query so user sees all options when focusing
    if (value) {
      setQuery("");
    }
  };

  return (
    <div className="flex flex-col gap-2 relative" ref={containerRef}>
      <label
        htmlFor="course"
        className="text-sm font-semibold text-neutral-900 flex items-center gap-2"
      >
        <BookOpen className="w-[18px] h-[18px] text-blue-500" />
        Mata Kuliah <span className="text-error">*</span>
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          id="course"
          type="text"
          placeholder="Cari mata kuliah..."
          value={isOpen ? query : value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          className={cn(
            "w-full px-4 py-3.5 rounded-xl border shadow-sm outline-none text-sm transition-all",
            isOpen
              ? "border-primary ring-4 ring-primary/10 bg-white text-neutral-900 placeholder:text-neutral-400"
              : value
                ? "border-primary bg-primary/5 text-primary font-bold"
                : "border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400"
          )}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 className="w-5 h-5 text-neutral-400 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-neutral-400" />
          )}
        </div>
      </div>

      {isOpen && !loading && (
        <div className="absolute top-[84px] left-0 right-0 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden z-50 max-h-[220px] overflow-y-auto no-scrollbar">
          {filtered.length > 0 ? (
            filtered.map((course) => {
              const isSelected = value === course.course_name;
              return (
                <button
                  key={course._id}
                  type="button"
                  onClick={() => handleSelect(course.course_name)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                    isSelected
                      ? "bg-primary/5 text-primary"
                      : "text-neutral-700 active:bg-neutral-50"
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                      isSelected
                        ? "bg-primary border-primary text-white"
                        : "border-neutral-300"
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium truncate",
                        isSelected && "font-bold"
                      )}
                    >
                      {course.course_name}
                    </p>
                    <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
                      {course.course_code}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-xs text-neutral-400 font-medium">
                {query ? "Tidak ditemukan" : "Belum ada mata kuliah tersedia"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

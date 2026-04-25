"use client";

import React, { useEffect, useState, useRef } from "react";
import { Brain, ChevronDown, Check, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAnalyticsStore } from "@/stores/analytics";

interface LearningStrategy {
  _id: string;
  learning_strat_name: string;
  description?: string;
}

interface StrategySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function StrategySelector({ value, onChange }: StrategySelectorProps) {
  const [strategies, setStrategies] = useState<LearningStrategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const analyticsStrategies = useAnalyticsStore((s) => s.strategies);
  const fetchStrategies = useAnalyticsStore((s) => s.fetchStrategies);

  const topStrategyName = analyticsStrategies?.strategies?.[0]?.has_sufficient_data
    ? analyticsStrategies.strategies[0].name
    : null;

  useEffect(() => {
    api
      .get<LearningStrategy[]>("/learningstrats")
      .then((data) => setStrategies(data))
      .catch(() => setStrategies([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!analyticsStrategies) {
      fetchStrategies().catch(() => {});
    }
  }, [analyticsStrategies, fetchStrategies]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selectedLabel =
    strategies.find((s) => s.learning_strat_name === value)?.learning_strat_name || "";

  return (
    <div className="flex flex-col gap-2" ref={dropdownRef}>
      <label className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
        <Brain className="w-[18px] h-[18px] text-purple-500" />
        Strategi Belajar <span className="text-error">*</span>
      </label>

      <button
        type="button"
        onClick={() => !loading && setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3.5 rounded-xl border shadow-sm transition-all text-left",
          isOpen
            ? "border-primary ring-4 ring-primary/10 bg-white"
            : value
              ? "border-primary bg-primary/5"
              : "border-neutral-200 bg-white active:bg-neutral-50"
        )}
      >
        <span
          className={cn(
            "text-sm font-medium truncate",
            value ? "text-primary font-bold" : "text-neutral-400"
          )}
        >
          {loading
            ? "Memuat strategi..."
            : selectedLabel || "Pilih strategi belajar..."}
        </span>
        {loading ? (
          <Loader2 className="w-5 h-5 text-neutral-400 animate-spin shrink-0" />
        ) : (
          <ChevronDown
            className={cn(
              "w-5 h-5 shrink-0 transition-transform",
              isOpen
                ? "text-primary rotate-180"
                : "text-neutral-400"
            )}
          />
        )}
      </button>

      {isOpen && !loading && (
        <div className="mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden z-50">
          {strategies.map((strat) => {
            const isSelected = value === strat.learning_strat_name;
            const isRecommended = topStrategyName === strat.learning_strat_name && !isSelected;
            return (
              <button
                key={strat._id}
                type="button"
                onClick={() => {
                  onChange(strat.learning_strat_name);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors",
                  isSelected
                    ? "bg-primary/5 text-primary"
                    : "text-neutral-700 active:bg-neutral-50 hover:bg-neutral-50"
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
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "text-sm font-medium truncate",
                        isSelected && "font-bold"
                      )}
                    >
                      {strat.learning_strat_name}
                    </p>
                    {isRecommended && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-[1px] rounded-md bg-purple-50 text-purple-600 text-[10px] font-bold shrink-0">
                        <Sparkles className="w-2.5 h-2.5" />
                        Rekomendasi
                      </span>
                    )}
                  </div>
                  {strat.description && (
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                      {strat.description}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
          {strategies.length === 0 && (
            <div className="px-4 py-6 text-center">
              <p className="text-xs text-neutral-400 font-medium">
                Belum ada strategi tersedia
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

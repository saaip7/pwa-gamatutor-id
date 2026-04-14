"use client";

import React from "react";
import { motion } from "framer-motion";
import { Info, ChevronDown } from "lucide-react";
import type { ConfidenceDataPoint } from "@/types";
import { cn } from "@/lib/utils";

interface CourseOption {
  code: string;
  name: string;
  dataPoints: number;
}

interface MasteryTrendChartProps {
  dataPoints: ConfidenceDataPoint[];
  trend: "improving" | "stable" | "declining" | null;
  courseCode: string | null;
  availableCourses: CourseOption[];
  onCourseChange: (courseCode: string | null) => void;
}

function buildSvgPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
}

function buildAreaPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  const line = buildSvgPath(points);
  const last = points[points.length - 1];
  const first = points[0];
  return `${line} L${last.x},100 L${first.x},100 Z`;
}

function normalizeGainToScale(gainPercent: number): number {
  // Map learning gain percentage to 1-5 scale for chart display
  // Negative (regression) → 1, 0% → 2.5 (mid), positive → up to 5
  // Linear: 0-50% range maps to 2.5-5
  if (gainPercent <= 0) {
    // Regression: -50% or worse = 1, 0% = 2.5
    return Math.max(1, 2.5 + (gainPercent / 50) * 1.5);
  }
  // Improvement: 0% = 2.5, 50%+ = 5
  return Math.min(5, 2.5 + (gainPercent / 50) * 2.5);
}

function mapDataToSvg(
  dataPoints: ConfidenceDataPoint[],
  key: "confidence" | "learningGain"
): { x: number; y: number }[] {
  const valid = dataPoints.filter((dp) => dp[key] != null);
  if (valid.length === 0) return [];
  return valid.map((dp, i) => {
    const x = valid.length === 1 ? 50 : (i / (valid.length - 1)) * 100;
    const rawValue = dp[key]!;
    const value = key === "learningGain" ? normalizeGainToScale(rawValue) : Math.max(1, Math.min(5, rawValue));
    const y = 100 - ((value - 1) / 4) * 100;
    return { x, y };
  });
}

function formatDateLabel(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  } catch {
    return dateStr;
  }
}

export function MasteryTrendChart({
  dataPoints,
  trend,
  courseCode,
  availableCourses,
  onCourseChange,
}: MasteryTrendChartProps) {
  const hasData = dataPoints.length >= 2;
  const hasCourses = availableCourses.length > 0;

  const confidencePoints = hasData ? mapDataToSvg(dataPoints, "confidence") : [];
  const gainPoints = hasData ? mapDataToSvg(dataPoints, "learningGain") : [];

  const trendLabel =
    trend === "improving"
      ? "Meningkat"
      : trend === "stable"
        ? "Stabil"
        : trend === "declining"
          ? "Menurun"
          : null;

  // X-axis dates from valid data points only
  const dateLabels = dataPoints.map((dp) => dp.date);

  return (
    <motion.div
      className="bg-white border border-neutral-200 rounded-xl p-4 mt-4 shadow-sm"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] as const }}
    >
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-sm font-bold text-neutral-800">Mastery & Growth Trend</h3>
        <p className="text-[10px] text-neutral-500 mt-0.5">
          Confidence trend & your improvement
          {trendLabel && (
            <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded bg-neutral-100 text-[9px] font-bold text-neutral-600">
              {trendLabel}
            </span>
          )}
        </p>
      </div>

      {/* Course Selector */}
      {hasCourses && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 -mx-1 px-1">
          {availableCourses.map((course) => {
            const isActive = course.code === courseCode;
            return (
              <button
                key={course.code}
                title={course.name}
                onClick={() => onCourseChange(course.code)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all shrink-0 border",
                  isActive
                    ? "bg-primary text-white border-primary"
                    : "bg-neutral-50 text-neutral-500 border-neutral-100 hover:border-neutral-200 active:scale-95"
                )}
              >
                {course.code}
              </button>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-primary rounded-full" />
          <span className="text-[10px] font-medium text-neutral-600">Confidence Level</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 border-t-2 border-dashed border-emerald-500" />
          <span className="text-[10px] font-medium text-neutral-600">Learning Gain</span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative w-full h-32 mb-2">
        {hasData ? (
          <svg
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <defs>
              <linearGradient id="primary-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.15" />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid */}
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="var(--color-neutral-100)"
                strokeWidth="0.5"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {/* Area fill under confidence line */}
            {confidencePoints.length >= 2 && (
              <path d={buildAreaPath(confidencePoints)} fill="url(#primary-gradient)" />
            )}

            {/* Learning Gain (dashed green) */}
            {gainPoints.length >= 2 && (
              <path
                d={buildSvgPath(gainPoints)}
                fill="none"
                stroke="var(--color-success)"
                strokeWidth="1.5"
                strokeDasharray="2,2"
                vectorEffect="non-scaling-stroke"
              />
            )}

            {/* Confidence (solid blue) */}
            {confidencePoints.length >= 2 && (
              <path
                d={buildSvgPath(confidencePoints)}
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-xs text-neutral-400">Belum cukup data untuk menampilkan trend</p>
          </div>
        )}
      </div>

      {/* X-axis */}
      {hasData && dateLabels.length > 0 && (
        <div className="flex justify-between text-[8px] text-neutral-400 font-medium px-1 mt-2">
          {dateLabels.map((date, i) => (
            <span key={i}>{formatDateLabel(date)}</span>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-start gap-2">
        <Info className="text-xs text-neutral-400 mt-0.5 w-3 h-3 shrink-0" />
        <p className="text-[10px] text-neutral-500 leading-tight">
          {hasData
            ? "Data menunjukkan korelasi antara tingkat keyakinan diri dan peningkatan pembelajaran."
            : "Selesaikan tugas dengan rating confidence untuk melihat trend perkembanganmu."}
        </p>
      </div>
    </motion.div>
  );
}

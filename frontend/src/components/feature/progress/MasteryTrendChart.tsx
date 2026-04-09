"use client";

import React from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import type { ConfidenceDataPoint } from "@/types";

interface MasteryTrendChartProps {
  dataPoints: ConfidenceDataPoint[];
  trend: "improving" | "stable" | "declining" | null;
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

function mapDataToSvg(dataPoints: ConfidenceDataPoint[], key: "confidence" | "learningGain") {
  const count = dataPoints.length;
  if (count === 0) return [];
  return dataPoints.map((dp, i) => {
    const x = count === 1 ? 50 : (i / (count - 1)) * 100;
    const value = dp[key];
    // confidence/learningGain are 1-5 scale, map to SVG y (100=bottom=low, 0=top=high)
    const clampedValue = Math.max(1, Math.min(5, value));
    const y = 100 - ((clampedValue - 1) / 4) * 100;
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

export function MasteryTrendChart({ dataPoints, trend }: MasteryTrendChartProps) {
  const hasData = dataPoints.length >= 2;

  const confidencePoints = hasData ? mapDataToSvg(dataPoints, "confidence") : [];
  const gainPoints = hasData ? mapDataToSvg(dataPoints, "learningGain") : [];

  const trendLabel = trend === "improving" ? "Meningkat" : trend === "stable" ? "Stabil" : trend === "declining" ? "Menurun" : null;

  return (
    <motion.div
      className="bg-white border border-neutral-200 rounded-xl p-4 mt-4 shadow-sm"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mb-4">
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

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-primary rounded-full"></div>
          <span className="text-[10px] font-medium text-neutral-600">Confidence Level</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 border-t-2 border-dashed border-success"></div>
          <span className="text-[10px] font-medium text-neutral-600">Learning Gain</span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative w-full h-32 mb-2">
        {hasData ? (
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="primary-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.15" />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1="0" y1="0" x2="100" y2="0" stroke="var(--color-neutral-100)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
            <line x1="0" y1="25" x2="100" y2="25" stroke="var(--color-neutral-100)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="var(--color-neutral-100)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
            <line x1="0" y1="75" x2="100" y2="75" stroke="var(--color-neutral-100)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
            <line x1="0" y1="100" x2="100" y2="100" stroke="var(--color-neutral-100)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />

            {/* Primary Line Gradient Fill */}
            <path d={buildAreaPath(confidencePoints)} fill="url(#primary-gradient)" />

            {/* Secondary Line (Learning Gain - dashed green) */}
            <path
              d={buildSvgPath(gainPoints)}
              fill="none"
              stroke="var(--color-success)"
              strokeWidth="1.5"
              strokeDasharray="2,2"
              vectorEffect="non-scaling-stroke"
            />

            {/* Primary Line (Confidence - solid blue) */}
            <path
              d={buildSvgPath(confidencePoints)}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-xs text-neutral-400">Belum cukup data untuk menampilkan trend</p>
          </div>
        )}
      </div>

      {/* X-axis labels */}
      {hasData && (
        <div className="flex justify-between text-[8px] text-neutral-400 font-medium px-1 mt-2">
          {dataPoints.map((dp, i) => (
            <span key={i}>{formatDateLabel(dp.date)}</span>
          ))}
        </div>
      )}

      {/* Info Note */}
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

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";

export function MasteryTrendChart() {
  return (
    <motion.div 
      className="bg-white border border-neutral-200 rounded-xl p-4 mt-4 shadow-sm"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mb-4">
        <h3 className="text-sm font-bold text-neutral-800">Mastery & Growth Trend</h3>
        <p className="text-[10px] text-neutral-500 mt-0.5">Confidence trend & your improvement</p>
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
        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="primary-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.15"/>
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0"/>
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          <line x1="0" y1="0" x2="100" y2="0" stroke="var(--color-neutral-100)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="25" x2="100" y2="25" stroke="var(--color-neutral-100)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="var(--color-neutral-100)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="var(--color-neutral-100)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="100" x2="100" y2="100" stroke="var(--color-neutral-100)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
          
          {/* Primary Line Gradient Fill */}
          <path d="M0,80 L11,70 L22,60 L33,65 L44,40 L55,50 L66,25 L77,20 L88,10 L100,0 L100,100 L0,100 Z" fill="url(#primary-gradient)" />

          {/* Secondary Line (Learning Gain - dashed green) */}
          <path d="M0,85 L11,75 L22,65 L33,70 L44,50 L55,55 L66,35 L77,30 L88,20 L100,10" fill="none" stroke="var(--color-success)" strokeWidth="1.5" strokeDasharray="2,2" vectorEffect="non-scaling-stroke" />
          
          {/* Primary Line (Confidence - solid blue) */}
          <path d="M0,80 L11,70 L22,60 L33,65 L44,40 L55,50 L66,25 L77,20 L88,10 L100,0" fill="none" stroke="var(--color-primary)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between text-[8px] text-neutral-400 font-medium px-1 mt-2">
        <span>T1</span>
        <span>T2</span>
        <span>T3</span>
        <span>T4</span>
        <span>T5</span>
        <span>T6</span>
        <span>T7</span>
        <span>T8</span>
        <span>T9</span>
        <span>T10</span>
      </div>

      {/* Fallback Text Note */}
      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-start gap-2">
        <Info className="text-xs text-neutral-400 mt-0.5 w-3 h-3 shrink-0" />
        <p className="text-[10px] text-neutral-500 leading-tight">Enable score tracking for complete insights regarding the correlation between self-confidence and actual improvement.</p>
      </div>
    </motion.div>
  );
}

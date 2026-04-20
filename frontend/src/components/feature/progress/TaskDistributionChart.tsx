"use client";

import React from "react";
import { motion } from "framer-motion";

export interface TaskDistributionData {
  total: number;
  todoPercent: number;
  progPercent: number;
  revPercent: number;
  donePercent: number;
}

interface TaskDistributionChartProps {
  data: TaskDistributionData;
}

export function TaskDistributionChart({ data }: TaskDistributionChartProps) {
  const stop1 = data.todoPercent;
  const stop2 = stop1 + data.progPercent;
  const stop3 = stop2 + data.revPercent;
  
  const conicGradient = `conic-gradient(var(--color-primary) 0% ${stop1}%, var(--color-warning) ${stop1}% ${stop2}%, #A855F7 ${stop2}% ${stop3}%, var(--color-success) ${stop3}% 100%)`;

  return (
    <motion.div 
      className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm mt-4 w-full"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <h3 className="text-sm font-bold text-neutral-800 mb-5">Distribusi Tugas</h3>
      
      <div className="flex items-center gap-6">
        {/* Doughnut Chart */}
        <div className="relative w-[100px] h-[100px] shrink-0">
          <div className="w-full h-full rounded-full" style={{ background: conicGradient }}></div>
          {/* Inner circle */}
          <div className="absolute inset-[22%] bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
            <span className="text-lg font-bold text-neutral-800 leading-none">{data.total}</span>
            <span className="text-[10px] text-neutral-500 mt-0.5">tugas</span>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex-1 grid grid-cols-2 gap-y-3 gap-x-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary shrink-0"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-neutral-800">PLANNING</span>
              <span className="text-xs font-medium text-neutral-500">{data.todoPercent}%</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-warning shrink-0"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-neutral-800">MONITORING</span>
              <span className="text-xs font-medium text-neutral-500">{data.progPercent}%</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-neutral-800">CONTROLLING</span>
              <span className="text-xs font-medium text-neutral-500">{data.revPercent}%</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success shrink-0"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-neutral-800">REFLECTION</span>
              <span className="text-xs font-medium text-neutral-500">{data.donePercent}%</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

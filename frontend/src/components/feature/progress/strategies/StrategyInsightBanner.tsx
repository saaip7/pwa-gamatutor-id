"use client";

import React from "react";
import { Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

interface StrategyInsightBannerProps {
  strategyName: string;
  impactPercent: number;
}

export function StrategyInsightBanner({ strategyName, impactPercent }: StrategyInsightBannerProps) {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 shadow-sm relative overflow-hidden group">
        {/* Decorative background icon */}
        <div className="absolute -right-4 -top-4 opacity-[0.07] rotate-12 group-hover:rotate-0 transition-transform duration-700">
          <Lightbulb className="w-32 h-32 text-blue-600" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
              <span className="text-sm">💡</span>
            </div>
            <h2 className="font-bold text-blue-900 text-base tracking-tight">Insight Khusus Untukmu</h2>
          </div>
          <p className="text-blue-800 text-sm leading-relaxed pr-2">
            Strategi <strong className="font-extrabold text-blue-900">{strategyName}</strong> terbukti meningkatkan keyakinan dirimu hingga <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white font-black text-blue-700 shadow-sm mx-0.5">{impactPercent}%</span>. Gunakan lebih sering untuk tugas yang sulit!
          </p>
        </div>
      </div>
    </motion.section>
  );
}

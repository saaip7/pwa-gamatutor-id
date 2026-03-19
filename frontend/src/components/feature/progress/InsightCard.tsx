"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

interface InsightCardProps {
  insightText: string;
}

export function InsightCard({ insightText }: InsightCardProps) {
  return (
    <motion.div 
      className="bg-white border border-neutral-200 rounded-xl p-4 mb-4 shadow-sm flex items-start gap-3"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning shrink-0">
        <Lightbulb className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h3 className="text-xs font-bold text-neutral-800">Insight</h3>
        <p className="text-sm font-medium text-neutral-600 mt-0.5">{insightText}</p>
      </div>
    </motion.div>
  );
}

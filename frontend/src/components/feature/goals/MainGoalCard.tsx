"use client";

import React from "react";
import { motion } from "framer-motion";
import { Target, Edit2, Sparkles } from "lucide-react";

interface MainGoalCardProps {
  goalTextPre: string; // e.g., "Lulus dengan"
  goalTextHighlight: string; // e.g., "IPK 3.5"
}

export function MainGoalCard({ goalTextPre, goalTextHighlight }: MainGoalCardProps) {
  return (
    <motion.div 
      className="mt-2 p-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 relative overflow-hidden shadow-xl shadow-amber-500/25 border border-white/10 group"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Decorative background elements */}
      <div className="absolute -right-6 -top-6 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -left-6 -bottom-6 w-40 h-40 bg-orange-700/20 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Text Content */}
      <div className="relative z-10 flex flex-col">
        <div className="flex justify-between items-center w-full mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-amber-50 backdrop-blur-md border border-white/10 shadow-sm">
            <Target className="w-3.5 h-3.5" />
            Tujuan Utama
          </span>
          <button 
            type="button" 
            className="w-8 h-8 flex items-center justify-center rounded-full text-amber-50 hover:text-white hover:bg-white/10 transition-colors active:scale-95"
            aria-label="Edit main goal"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
        
        <div className="relative">
          <h2 className="text-3xl font-extrabold text-white leading-tight tracking-tight drop-shadow-md">
            {goalTextPre} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-yellow-50">
              {goalTextHighlight}
            </span>
          </h2>
          <Sparkles className="absolute top-0 right-4 text-white/40 w-10 h-10 animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}

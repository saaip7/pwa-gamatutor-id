"use client";

import React from "react";
import { motion } from "framer-motion";
import { Brain, Clock, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

interface StudyPatternData {
  productiveTime: string;
  productiveDays: string;
}

interface StudyPatternsProps {
  patterns: StudyPatternData;
}

export function StudyPatterns({ patterns }: StudyPatternsProps) {
  return (
    <motion.div 
      className="px-6 mb-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] border border-neutral-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-neutral-800 tracking-tight">Pola Belajarmu ✨</h3>
          </div>
        </div>
        
        <div className="space-y-2.5 mb-5">
          {/* Waktu Produktif */}
          <div className="bg-neutral-50/80 rounded-[14px] p-3.5 flex items-start gap-3 border border-neutral-100/50">
            <div className="mt-0.5 text-primary">
              <Clock className="w-[18px] h-[18px]" />
            </div>
            <div>
              <p className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider mb-0.5">Waktu Produktif</p>
              <p className="text-[13px] font-bold text-neutral-800">{patterns.productiveTime}</p>
            </div>
          </div>
          
          {/* Hari Produktif */}
          <div className="bg-neutral-50/80 rounded-[14px] p-3.5 flex items-start gap-3 border border-neutral-100/50">
            <div className="mt-0.5 text-primary">
              <Calendar className="w-[18px] h-[18px]" />
            </div>
            <div>
              <p className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider mb-0.5">Hari Produktif</p>
              <p className="text-[13px] font-bold text-neutral-800">{patterns.productiveDays}</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-neutral-100 pt-5">
          <p className="text-[12px] font-medium text-neutral-500 mb-3 text-center">Jadwalkan tugas penting di waktu terbaikmu</p>
          <Link 
            href="/progress" 
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-[14px] border-2 border-neutral-100 text-neutral-700 font-bold text-[13px] hover:bg-neutral-50 active:scale-[0.98] transition-all"
          >
            Lihat Statistik Lengkap
            <ArrowRight className="w-[15px] h-[15px]" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

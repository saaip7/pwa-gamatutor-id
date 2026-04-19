"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, Calendar } from "lucide-react";

function parseInsight(raw: string | undefined) {
  if (!raw || raw === "-") return null;
  const match = raw.match(/^(.+?)\s*\((\d+)%\)$/);
  if (match) return { label: match[1], pct: parseInt(match[2], 10) };
  return { label: raw, pct: null };
}

interface InsightCardProps {
  productiveTime?: string;
  productiveDays?: string;
}

export function InsightCard({ productiveTime, productiveDays }: InsightCardProps) {
  const time = parseInsight(productiveTime);
  const day = parseInsight(productiveDays);
  const hasData = time || day;

  return (
    <motion.div
      className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm mb-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
          Insight Belajar
        </h3>
        <span className="text-[11px] text-neutral-400 font-medium">30 hari terakhir</span>
      </div>

      {!hasData ? (
        <p className="text-sm text-neutral-400 text-center py-2">Belum cukup data untuk menampilkan insight</p>
      ) : (
        <div className="space-y-3">
          {time && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider">Waktu Produktif</span>
              </div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold text-neutral-700">{time.label}</span>
                {time.pct !== null && <span className="text-sm font-extrabold text-primary">{time.pct}%</span>}
              </div>
              {time.pct !== null && (
                <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary/60 rounded-full" style={{ width: `${time.pct}%` }} />
                </div>
              )}
            </div>
          )}

          {day && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider">Hari Produktif</span>
              </div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold text-neutral-700">{day.label}</span>
                {day.pct !== null && <span className="text-sm font-extrabold text-primary">{day.pct}%</span>}
              </div>
              {day.pct !== null && (
                <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary/60 rounded-full" style={{ width: `${day.pct}%` }} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

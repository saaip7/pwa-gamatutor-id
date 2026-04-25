"use client";

import React from "react";
import { Brain, Clock, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface StudyPatternData {
  productive_time: string;
  productive_days: string;
}

interface StudyPatternsProps {
  patterns: StudyPatternData;
  className?: string;
}

function parseInsight(raw: string) {
  const match = raw.match(/^(.+?)\s*\((\d+)%\)$/);
  if (match) return { label: match[1], pct: parseInt(match[2], 10) };
  return { label: raw, pct: null };
}

export function StudyPatterns({ patterns, className }: StudyPatternsProps) {
  const hasTime = patterns.productive_time && patterns.productive_time !== "-";
  const hasDays = patterns.productive_days && patterns.productive_days !== "-";
  const hasData = hasTime || hasDays;

  const time = parseInsight(patterns.productive_time ?? "-");
  const days = parseInsight(patterns.productive_days ?? "-");

  return (
    <div
      className={cn("anim-fade-in-up", className)}
      style={{ animationDelay: "0.3s" }}
    >
      <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] border border-neutral-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-800 tracking-tight">Pola Belajarmu</h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">Berdasarkan 30 hari terakhir</p>
          </div>
        </div>

        {!hasData ? (
          <div className="py-6 text-center">
            <p className="text-sm text-neutral-400">Belum cukup data untuk menampilkan pola belajar</p>
            <p className="text-[11px] text-neutral-300 mt-1">Minimal 7 sesi belajar dalam 30 hari terakhir</p>
          </div>
        ) : (
          <div className="space-y-3 mb-5">
            {hasTime && (
              <div className="bg-neutral-50/80 rounded-[14px] p-3.5 border border-neutral-100/50">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-[15px] h-[15px] text-primary" />
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Waktu Produktif</span>
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-bold text-neutral-800">{time.label}</span>
                  {time.pct !== null && (
                    <span className="text-[13px] font-extrabold text-primary">{time.pct}%</span>
                  )}
                </div>
                {time.pct !== null && (
                  <div className="h-1.5 bg-neutral-200/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full anim-grow-width"
                      style={{ width: `${time.pct}%`, animationDelay: "0.4s" }}
                    />
                  </div>
                )}
              </div>
            )}

            {hasDays && (
              <div className="bg-neutral-50/80 rounded-[14px] p-3.5 border border-neutral-100/50">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-[15px] h-[15px] text-primary" />
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Hari Produktif</span>
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-bold text-neutral-800">{days.label}</span>
                  {days.pct !== null && (
                    <span className="text-[13px] font-extrabold text-primary">{days.pct}%</span>
                  )}
                </div>
                {days.pct !== null && (
                  <div className="h-1.5 bg-neutral-200/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full anim-grow-width"
                      style={{ width: `${days.pct}%`, animationDelay: "0.5s" }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="border-t border-neutral-100 pt-4">
          <Link
            href="/progress"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-[14px] border-2 border-neutral-100 text-neutral-700 font-bold text-sm hover:bg-neutral-50 active:scale-[0.98] transition-all"
          >
            Lihat Statistik Lengkap
            <ArrowRight className="w-[15px] h-[15px]" />
          </Link>
        </div>
      </div>
    </div>
  );
}

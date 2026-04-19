"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Trophy, ChevronLeft } from "lucide-react";
import { SettingsHeader } from "@/components/feature/settings/SettingsHeader";
import { StreakFreezeCard } from "@/components/feature/streak/StreakFreezeCard";
import { StreakFreezeCelebration } from "@/components/feature/streak/StreakFreezeCelebration";
import { useAnalyticsStore } from "@/stores/analytics";
import { usePreferencesStore } from "@/stores/preferences";
import { toast } from "sonner";

const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday=0
}

interface DayCell {
  date: number; // 0 = empty
  state: "active" | "freeze" | "inactive" | "today" | "empty";
}

function buildCalendarRows(
  year: number,
  month: number,
  activeDates: string[],
  freezeDates: string[],
  today: Date
): DayCell[][] {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const activeSet = new Set(activeDates);
  const freezeSet = new Set(freezeDates);

  const cells: DayCell[] = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push({ date: 0, state: "empty" });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const isToday = dateStr === todayStr && year === today.getFullYear() && month === today.getMonth();
    const isFuture = new Date(year, month, d) > today;

    let state: DayCell["state"];
    if (isFuture) {
      state = "empty";
    } else if (activeSet.has(dateStr)) {
      state = "active";
    } else if (freezeSet.has(dateStr)) {
      state = "freeze";
    } else if (isToday) {
      state = "today";
    } else {
      state = "inactive";
    }

    cells.push({ date: d, state });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ date: 0, state: "empty" });
  }

  const rows: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  return rows;
}

function getMonthActivityCounts(activeDates: string[], year: number): number[] {
  const counts = new Array(12).fill(0);
  activeDates.forEach((d) => {
    const date = new Date(d + "T00:00:00");
    if (date.getFullYear() === year) counts[date.getMonth()]++;
  });
  return counts;
}

export default function StreakPage() {
  const { streakHistory, fetchStreakHistory, fetchStreak } = useAnalyticsStore();
  const useStreakFreeze = usePreferencesStore((s) => s.useStreakFreeze);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [freezeLoading, setFreezeLoading] = useState(false);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const isCurrent = selectedMonth === currentMonth && selectedYear === currentYear;

  useEffect(() => { fetchStreakHistory(); }, [fetchStreakHistory]);

  const activeDates = streakHistory?.active_dates ?? [];
  const freezeDates = streakHistory?.freeze_dates ?? [];
  const currentStreak = streakHistory?.current ?? 0;
  const longestStreak = streakHistory?.longest ?? 0;
  const freezesAvailable = streakHistory?.freezes_available ?? 0;

  const rows = useMemo(
    () => buildCalendarRows(selectedYear, selectedMonth, activeDates, freezeDates, today),
    [selectedYear, selectedMonth, activeDates, freezeDates]
  );

  const monthCounts = useMemo(
    () => getMonthActivityCounts(activeDates, selectedYear),
    [activeDates, selectedYear]
  );

  const activeInMonth = useMemo(() => {
    const prefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;
    return activeDates.filter((d) => d.startsWith(prefix)).length;
  }, [activeDates, selectedYear, selectedMonth]);

  const totalDays = getDaysInMonth(selectedYear, selectedMonth);

  const handleUseFreeze = async () => {
    setFreezeLoading(true);
    try {
      await useStreakFreeze();
      await fetchStreak();
      setIsCelebrationOpen(true);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menggunakan streak freeze");
    } finally {
      setFreezeLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col mx-auto overflow-hidden relative max-w-md">
      <SettingsHeader title="Streak" />

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pt-6 pb-12 space-y-6">

        {/* ── Hero ── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center pt-4 pb-2"
        >
          <div className="relative w-24 h-24 flex items-center justify-center mb-3">
            <div className="absolute inset-0 bg-amber-400 rounded-full blur-[24px] opacity-25 animate-pulse-glow" />
            <Flame className="text-amber-500 w-16 h-16 drop-shadow-xl relative z-10 animate-flame" />
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-5xl font-extrabold text-neutral-900 tracking-tight leading-none">
              {currentStreak}
            </span>
            <span className="text-base font-bold text-neutral-400 leading-none">hari</span>
          </div>

          <p className="text-[13px] text-neutral-500 font-medium mt-0.5">Hari berturut-turut</p>

          <div className="mt-3 inline-flex items-center gap-1.5 bg-neutral-50 border border-neutral-100 rounded-full px-3.5 py-1">
            <Trophy className="w-3 h-3 text-amber-400" />
            <span className="text-[11px] font-bold text-neutral-500">Terpanjang: {longestStreak} hari</span>
          </div>
        </motion.section>

        {/* ── Monthly Calendar ── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-bold text-neutral-900">
                {MONTH_NAMES[selectedMonth]} {selectedYear}
              </h3>
              {!isCurrent && (
                <button
                  onClick={() => { setSelectedMonth(currentMonth); setSelectedYear(currentYear); }}
                  className="flex items-center gap-0.5 text-[11px] font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                >
                  <ChevronLeft className="w-3 h-3" />
                  Bulan ini
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedYear}-${selectedMonth}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {/* Weekday header */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {WEEKDAYS.map((d) => (
                    <div key={d} className="text-center">
                      <span className="text-[10px] font-bold text-neutral-400">{d}</span>
                    </div>
                  ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 gap-1">
                  {rows.flat().map((cell, i) => {
                    if (cell.date === 0) {
                      return <div key={i} className="aspect-square" />;
                    }

                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded-lg flex items-center justify-center transition-colors ${
                          cell.state === "active" ? "bg-blue-500 text-white font-bold"
                          : cell.state === "freeze" ? "bg-blue-50 text-blue-400 font-semibold shadow-[inset_0_0_0_1px_rgba(96,165,250,0.3)]"
                          : cell.state === "inactive" ? "bg-red-50 text-red-300 font-semibold shadow-[inset_0_0_0_1px_rgba(248,113,113,0.2)]"
                          : cell.state === "today" ? "border-2 border-dashed border-amber-400 text-amber-500 font-semibold bg-amber-50/50"
                          : "bg-neutral-50 text-neutral-300"
                        }`}
                      >
                        <span className="text-[11px] leading-none">{cell.date}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Summary */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                  <span className="text-[10px] text-neutral-400">Aktif</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-sm bg-blue-50 shadow-[inset_0_0_0_1px_rgba(96,165,250,0.3)]" />
                  <span className="text-[10px] text-neutral-400">Freeze</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-sm bg-red-50 shadow-[inset_0_0_0_1px_rgba(248,113,113,0.2)]" />
                  <span className="text-[10px] text-neutral-400">Terlewat</span>
                </div>
              </div>
              <span className="text-[10px] text-neutral-500 font-semibold">
                {activeInMonth}/{totalDays}
              </span>
            </div>
          </div>
        </motion.section>

        {/* ── 12-Month Year Overview ── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <h3 className="text-[13px] font-bold text-neutral-900 mb-3">Aktivitas {currentYear}</h3>

            {/* 2 rows × 6 months */}
            <div className="flex flex-col gap-2">
              {[0, 6].map((start) => (
                <div key={start} className="flex gap-2">
                  {monthCounts.slice(start, start + 6).map((count, idx) => {
                    const i = start + idx;
                    const isCurrent = i === currentMonth;
                    const isPast = i < currentMonth;
                    const isSelected = i === selectedMonth;

                    let ringClass: string;
                    if (isCurrent) {
                      ringClass = "ring-2 ring-blue-300 ring-offset-1";
                    } else if (isPast) {
                      ringClass = isSelected ? "ring-2 ring-neutral-500 ring-offset-1" : "";
                    } else {
                      ringClass = isSelected ? "ring-2 ring-neutral-500 ring-offset-1" : "";
                    }

                    const isEmpty = !isCurrent && !isPast;
                    const bgColor = isCurrent || isPast ? "#2b7fff" : undefined;

                    return (
                      <button
                        key={i}
                        onClick={() => { setSelectedMonth(i); setSelectedYear(currentYear); }}
                        className="flex-1 flex flex-col items-center gap-1.5 group"
                      >
                        <div
                          className={`w-full aspect-square rounded-xl ${ringClass} ${isEmpty ? "bg-neutral-100" : ""} transition-all duration-200 group-active:scale-90`}
                          style={bgColor ? { background: bgColor } : undefined}
                          title={`${MONTH_NAMES[i]}: ${count} hari aktif`}
                        />
                        <span className={`text-[10px] font-bold leading-none ${
                          isCurrent ? "text-blue-600" : isSelected ? "text-neutral-800" : "text-neutral-400"
                        }`}>
                          {MONTH_ABBR[i]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── Streak Freeze ── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
        >
          <StreakFreezeCard
            available={freezesAvailable}
            onUse={handleUseFreeze}
            loading={freezeLoading}
          />
        </motion.section>
      </main>

      <StreakFreezeCelebration
        isOpen={isCelebrationOpen}
        onClose={() => setIsCelebrationOpen(false)}
      />
    </div>
  );
}

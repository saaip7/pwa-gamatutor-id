"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Loader2,
  Timer,
  Zap,
  ArrowUpDown,
  CheckCircle2,
} from "lucide-react";
import { FilterBar } from "@/components/feature/board/FilterBar";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SessionEntry {
  session_id: string;
  card_id: string;
  task_name: string;
  course_name: string;
  course_code: string;
  start_time: string | null;
  end_time: string | null;
  duration_sec: number;
  status: "completed" | "active";
  auto_ended: boolean;
  has_reflection: boolean;
}

interface HistoryResponse {
  sessions: SessionEntry[];
  available_courses: { name: string; code: string }[];
  summary: {
    total_sessions: number;
    total_study_sec: number;
    total_courses: number;
  };
}

type SortMode = "time" | "longest";

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec}d`;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return m > 0 ? `${h}j ${m}m` : `${h} jam`;
  return `${m} mnt`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SessionsPage() {
  const router = useRouter();
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [sortMode, setSortMode] = useState<SortMode>("time");

  const fetchData = useCallback(
    (courseCode?: string, sort?: SortMode) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (courseCode) params.set("course_code", courseCode);
      if (sort && sort !== "time") params.set("sort", sort);
      const qs = params.toString();
      const url = `/api/study-sessions/history${qs ? `?${qs}` : ""}`;
      api
        .get<HistoryResponse>(url)
        .then((res) => setData(res))
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    },
    []
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filterOptions = useMemo(() => {
    if (!data) return ["Semua"];
    return ["Semua", ...data.available_courses.map((c) => c.code)];
  }, [data]);

  const handleFilterChange = useCallback(
    (filter: string) => {
      setActiveFilter(filter);
      fetchData(filter === "Semua" ? undefined : filter, sortMode);
    },
    [fetchData, sortMode]
  );

  const toggleSort = useCallback(() => {
    const next: SortMode = sortMode === "time" ? "longest" : "time";
    setSortMode(next);
    fetchData(
      activeFilter === "Semua" ? undefined : activeFilter,
      next
    );
  }, [fetchData, activeFilter, sortMode]);

  const sessions = data?.sessions ?? [];
  const summary = data?.summary;

  const fmtSec = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    if (h > 0) return m > 0 ? `${h}j ${m}m` : `${h} jam`;
    return `${m} mnt`;
  };

  return (
    <div className="w-full h-screen flex flex-col mx-auto bg-white relative overflow-hidden max-w-md">
      <header className="shrink-0 pt-14 pb-3 px-5 border-b border-neutral-100 flex items-center gap-3 bg-white z-50">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-50 border border-neutral-100 text-neutral-600 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-neutral-900">Riwayat Belajar</h1>
        </div>
        <button
          onClick={toggleSort}
          className={cn(
            "h-9 px-3 flex items-center gap-1.5 rounded-xl border text-xs font-semibold transition-all active:scale-95",
            sortMode === "longest"
              ? "bg-neutral-800 text-white border-neutral-800"
              : "bg-neutral-50 text-neutral-500 border-neutral-200"
          )}
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          {sortMode === "time" ? "Terbaru" : "Terlama"}
        </button>
      </header>

      {loading && !data ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
        </div>
      ) : (
        <>
          {filterOptions.length > 1 && (
            <FilterBar
              filters={filterOptions}
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
            />
          )}

          <div className="flex-1 overflow-y-auto no-scrollbar">
            {summary && (
              <div className="px-5 pt-4 pb-1 flex gap-3">
                <div className="flex-1 rounded-2xl bg-primary/5 border border-primary/10 px-4 py-3">
                  <p className="text-[10px] font-bold text-primary/50 uppercase tracking-wider">Total Sesi</p>
                  <p className="text-xl font-black text-primary mt-0.5">{summary.total_sessions}</p>
                </div>
                <div className="flex-1 rounded-2xl bg-primary/5 border border-primary/10 px-4 py-3">
                  <p className="text-[10px] font-bold text-primary/50 uppercase tracking-wider">Waktu Belajar</p>
                  <p className="text-xl font-black text-primary mt-0.5">{fmtSec(summary.total_study_sec)}</p>
                </div>
                <div className="flex-1 rounded-2xl bg-primary/5 border border-primary/10 px-4 py-3">
                  <p className="text-[10px] font-bold text-primary/50 uppercase tracking-wider">Mata Kuliah</p>
                  <p className="text-xl font-black text-primary mt-0.5">{summary.total_courses}</p>
                </div>
              </div>
            )}

            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-neutral-300" />
                </div>
                <p className="text-sm text-neutral-400">
                  {activeFilter !== "Semua"
                    ? "Tidak ada sesi untuk mata kuliah ini"
                    : "Belum ada sesi belajar"}
                </p>
              </div>
            ) : (
              <div className="px-5 py-4 space-y-3">
                {sessions.map((s) => (
                  <div
                    key={s.session_id}
                    className="rounded-2xl border border-neutral-100 bg-white p-4"
                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-neutral-800 leading-snug truncate">
                          {s.task_name}
                        </p>
                        {s.course_name && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <BookOpen className="w-3 h-3 text-neutral-400 shrink-0" />
                            <span className="text-xs text-neutral-400 truncate">
                              {s.course_code || s.course_name}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        {s.status === "active" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                            <Zap className="w-3 h-3" />
                            Aktif
                          </span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Timer className="w-3.5 h-3.5 text-primary" />
                            <span className="text-sm font-bold text-primary">
                              {formatDuration(s.duration_sec)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-neutral-50">
                      <span className="text-xs text-neutral-400">
                        {formatDate(s.start_time)}
                      </span>
                      {s.start_time && (
                        <span className="text-xs text-neutral-300">
                          {formatTime(s.start_time)}
                        </span>
                      )}
                      {s.auto_ended && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-400">
                          Auto
                        </span>
                      )}
                      {s.has_reflection ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-500 ml-auto">
                          <CheckCircle2 className="w-3 h-3" />
                          Refleksi
                        </span>
                      ) : s.status === "completed" ? (
                        <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded bg-neutral-50 text-neutral-300 ml-auto">
                          Belum refleksi
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import {
  Clock,
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Zap,
  Timer,
  Users,
  Flame,
  UserCheck,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

interface SchedulerJob {
  id: string;
  name: string;
  trigger: string;
  next_run_time: string | null;
  triggerable: boolean;
  label: string;
}

interface SchedulerLog {
  _id: string;
  job_id: string;
  status: "success" | "error";
  triggered_by: "scheduler" | "manual";
  started_at: string;
  finished_at: string;
  duration_ms: number;
  stats?: Record<string, number>;
  error?: string;
}

const JOB_META: Record<string, { icon: React.ElementType; color: string; bg: string; description: string }> = {
  deadline_reminder: {
    icon: Clock,
    color: "#d97706",
    bg: "rgba(217,119,6,0.1)",
    description: "Cek tugas dengan deadline < 24 jam",
  },
  smart_reminder: {
    icon: Zap,
    color: "#2563eb",
    bg: "rgba(37,99,235,0.1)",
    description: "Reminder belajar berdasarkan aktivitas (A/B/C)",
  },
  streak_nudge: {
    icon: Flame,
    color: "#ea580c",
    bg: "rgba(234,88,12,0.1)",
    description: "Nudge user dengan streak aktif yang belum belajar",
  },
  social_presence: {
    icon: Users,
    color: "#16a34a",
    bg: "rgba(22,163,74,0.1)",
    description: "Notifikasi teman yang sedang belajar",
  },
  cleanup_orphan_sessions: {
    icon: Trash2,
    color: "#78716c",
    bg: "rgba(120,113,108,0.1)",
    description: "Bersihkan session tanpa activity",
  },
  check_idle_sessions: {
    icon: Timer,
    color: "#78716c",
    bg: "rgba(120,113,108,0.1)",
    description: "Cek session idle",
  },
  auto_end_stale_sessions: {
    icon: UserCheck,
    color: "#78716c",
    bg: "rgba(120,113,108,0.1)",
    description: "Akhiri session yang sudah stale",
  },
  reset_stale_streaks: {
    icon: RefreshCw,
    color: "#78716c",
    bg: "rgba(120,113,108,0.1)",
    description: "Reset streak yang sudah stale",
  },
};

const JOB_LABELS: Record<string, string> = {
  deadline_reminder: "Deadline Reminder",
  smart_reminder: "Smart Reminder",
  streak_nudge: "Streak Nudge",
  social_presence: "Social Presence",
  cleanup_orphan_sessions: "Orphan Cleanup",
  check_idle_sessions: "Idle Check",
  auto_end_stale_sessions: "Auto End Stale",
  reset_stale_streaks: "Reset Stale Streaks",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function getNextRunRelative(iso: string | null) {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  if (diff < 0) return "sebentar lagi";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ${mins % 60}m`;
  return `${Math.floor(hours / 24)}h`;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AdminSchedulerPage() {
  const [tab, setTab] = useState<"jobs" | "logs">("jobs");

  const [jobs, setJobs] = useState<SchedulerJob[]>([]);
  const [logs, setLogs] = useState<SchedulerLog[]>([]);
  const [logTotal, setLogTotal] = useState(0);
  const [logPage, setLogPage] = useState(1);
  const [logFilter, setLogFilter] = useState("");

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [triggeringId, setTriggeringId] = useState<string | null>(null);

  const LOG_PER_PAGE = 20;

  // ── Fetch jobs ──────────────────────────────────────────────────────────

  const fetchJobs = useCallback(async () => {
    try {
      setLoadingJobs(true);
      const res = await api.get<{ jobs: SchedulerJob[] }>("/admin/scheduler/status");
      setJobs(res.jobs);
    } catch (e) {
      console.error("Failed to fetch scheduler status", e);
      setJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  // ── Fetch logs ──────────────────────────────────────────────────────────

  const fetchLogs = useCallback(async (page: number, filter: string) => {
    try {
      setLoadingLogs(true);
      const params = new URLSearchParams({ page: String(page), per_page: String(LOG_PER_PAGE) });
      if (filter) params.set("job_id", filter);
      const res = await api.get<{
        data: SchedulerLog[];
        total: number;
        page: number;
        per_page: number;
      }>(`/admin/scheduler/logs?${params}`);
      setLogs(res.data);
      setLogTotal(res.total);
    } catch (e) {
      console.error("Failed to fetch scheduler logs", e);
      setLogs([]);
      setLogTotal(0);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    fetchLogs(logPage, logFilter);
  }, [fetchLogs, logPage, logFilter]);

  // ── Manual trigger ──────────────────────────────────────────────────────

  const handleTrigger = async (jobId: string) => {
    if (triggeringId) return;
    setTriggeringId(jobId);
    try {
      await api.post<{ message: string; stats: Record<string, number> }>(
        "/admin/scheduler/trigger",
        { job_id: jobId }
      );
      await Promise.all([fetchJobs(), fetchLogs(1, logFilter)]);
      setLogPage(1);
    } catch (e) {
      console.error("Failed to trigger job", e);
      alert("Gagal menjalankan job. Cek console untuk detail.");
    } finally {
      setTriggeringId(null);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-neutral-800">Scheduler</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Monitor dan trigger manual job notifikasi</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200">
        {(["jobs", "logs"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors relative",
              tab === t
                ? "text-blue-600"
                : "text-neutral-500 hover:text-neutral-700"
            )}
          >
            {t === "jobs" ? "Jobs" : "Run History"}
            {tab === t && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* ── Jobs Tab ─────────────────────────────────────────────────────── */}
      {tab === "jobs" && (
        <div className="space-y-3">
          {loadingJobs ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              Memuat jobs...
            </div>
          ) : (
            jobs.map((job) => {
              const meta = JOB_META[job.id] || { icon: Clock, color: "#78716c", bg: "rgba(120,113,108,0.1)", description: job.id };
              const Icon = meta.icon;
              const relative = getNextRunRelative(job.next_run_time);

              return (
                <div
                  key={job.id}
                  className="rounded-lg border border-neutral-200 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                  style={{ background: "#fff" }}
                >
                  {/* Icon + Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: meta.bg }}
                    >
                      <Icon className="w-4 h-4" style={{ color: meta.color }} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-neutral-800 truncate">
                          {JOB_LABELS[job.id] || job.id}
                        </span>
                        <span className="text-xs text-neutral-400 truncate hidden sm:inline">
                          {job.trigger}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">{meta.description}</p>
                    </div>
                  </div>

                  {/* Next run + Trigger */}
                  <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    {job.next_run_time && (
                      <div className="text-right">
                        <div className="text-xs font-medium text-neutral-600">
                          {relative || "—"}
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          {new Date(job.next_run_time).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    )}

                    {job.triggerable ? (
                      <button
                        onClick={() => handleTrigger(job.id)}
                        disabled={!!triggeringId}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                          triggeringId === job.id
                            ? "bg-blue-100 text-blue-400 cursor-wait"
                            : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                        )}
                      >
                        {triggeringId === job.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                        {triggeringId === job.id ? "Running..." : "Trigger"}
                      </button>
                    ) : (
                      <span className="text-[11px] px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-400 font-medium">
                        auto only
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Logs Tab ─────────────────────────────────────────────────────── */}
      {tab === "logs" && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex items-center gap-3">
            <select
              value={logFilter}
              onChange={(e) => {
                setLogFilter(e.target.value);
                setLogPage(1);
              }}
              className="px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-neutral-700"
            >
              <option value="">Semua Job</option>
              {Object.entries(JOB_LABELS)
                .filter(([id]) =>
                  ["deadline_reminder", "smart_reminder", "streak_nudge", "social_presence"].includes(id)
                )
                .map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
            </select>
            <button
              onClick={() => { fetchJobs(); fetchLogs(logPage, logFilter); }}
              className="p-2 rounded-lg border border-neutral-200 text-neutral-400 hover:text-neutral-600 hover:border-neutral-300 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-neutral-200 overflow-hidden" style={{ background: "#fff" }}>
            {loadingLogs ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                Memuat logs...
              </div>
            ) : !logs || logs.length === 0 ? (
              <div className="text-sm text-neutral-400 py-12 text-center">
                Belum ada run history
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50/50">
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Job
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Triggered
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Waktu
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Durasi
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Stats
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {logs.map((log) => {
                    const meta = JOB_META[log.job_id];
                    const Icon = meta?.icon || Clock;

                    return (
                      <tr key={log._id} className="hover:bg-neutral-50/50 transition-colors">
                        {/* Job name */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                              style={{ background: meta?.bg || "rgba(120,113,108,0.1)" }}
                            >
                              <Icon className="w-3 h-3" style={{ color: meta?.color || "#78716c" }} />
                            </div>
                            <span className="text-neutral-700 text-sm font-medium">
                              {JOB_LABELS[log.job_id] || log.job_id}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          {log.status === "success" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                              <CheckCircle2 className="w-3 h-3" />
                              success
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                              <XCircle className="w-3 h-3" />
                              error
                            </span>
                          )}
                        </td>

                        {/* Triggered by */}
                        <td className="px-4 py-3">
                          {log.triggered_by === "manual" ? (
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                              manual
                            </span>
                          ) : (
                            <span className="text-xs text-neutral-400">scheduler</span>
                          )}
                        </td>

                        {/* Time */}
                        <td className="px-4 py-3">
                          <span className="text-xs text-neutral-600">{fmtDateTime(log.started_at)}</span>
                        </td>

                        {/* Duration */}
                        <td className="px-4 py-3">
                          <span className="text-xs text-neutral-500 tabular-nums">{fmtDuration(log.duration_ms)}</span>
                        </td>

                        {/* Stats */}
                        <td className="px-4 py-3">
                          {log.error ? (
                            <span className="text-xs text-red-500 truncate max-w-[160px] block" title={log.error}>
                              {log.error}
                            </span>
                          ) : log.stats && Object.keys(log.stats).length > 0 ? (
                            <span className="text-xs text-neutral-500">
                              {Object.entries(log.stats)
                                .map(([k, v]) => `${k}=${v}`)
                                .join(", ")}
                            </span>
                          ) : (
                            <span className="text-xs text-neutral-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loadingLogs && logTotal > LOG_PER_PAGE && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">
                {Math.min((logPage - 1) * LOG_PER_PAGE + 1, logTotal)}–
                {Math.min(logPage * LOG_PER_PAGE, logTotal)} dari {logTotal}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                  disabled={logPage <= 1}
                  className="p-1.5 rounded-md border border-neutral-200 text-neutral-400 hover:text-neutral-600 hover:border-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-neutral-500 px-2">{logPage}</span>
                <button
                  onClick={() => setLogPage((p) => p + 1)}
                  disabled={logPage * LOG_PER_PAGE >= logTotal}
                  className="p-1.5 rounded-md border border-neutral-200 text-neutral-400 hover:text-neutral-600 hover:border-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

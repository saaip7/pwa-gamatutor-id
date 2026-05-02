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
  paused: boolean;
  channel: string;
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

// Backend returns naive UTC ISO strings (e.g. "2025-01-15T03:28:39.123456").
// APScheduler may include offset (e.g. "+00:00"). Normalize both to UTC before display.
function toLocalDate(iso: string): Date {
  if (!iso) return new Date(NaN);
  // Already has offset like +00:00 or Z → parse as-is (browser converts to local)
  if (iso.includes("+") || iso.endsWith("Z")) return new Date(iso);
  // Naive ISO → treat as UTC
  return new Date(iso + "Z");
}

function fmtDateTime(iso: string) {
  return toLocalDate(iso).toLocaleDateString("id-ID", {
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
  const diff = toLocalDate(iso).getTime() - Date.now();
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
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [triggerOptions, setTriggerOptions] = useState<
    Record<string, { skip_quiet_hours: boolean; force_email: boolean; skip_dedup: boolean }>
  >({});

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
    const opts = triggerOptions[jobId] || {};
    try {
      await api.post<{ message: string; stats: Record<string, number> }>(
        "/admin/scheduler/trigger",
        { job_id: jobId, options: opts }
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

  const handleToggle = async (jobId: string) => {
    if (togglingId) return;
    setTogglingId(jobId);
    try {
      await api.post<{ paused: boolean }>("/admin/scheduler/toggle", { job_id: jobId });
      await fetchJobs();
    } catch (e) {
      console.error("Failed to toggle job", e);
    } finally {
      setTogglingId(null);
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
                  className={cn(
                    "rounded-lg border",
                    job.paused ? "border-amber-200 bg-amber-50/50" : "border-neutral-200"
                  )}
                  style={job.paused ? {} : { background: "#fff" }}
                >
                  {/* ── Row 1: Info + Controls ── */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 pb-3">
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
                          {/* Channel badge */}
                          <span
                            className={cn(
                              "text-[10px] font-medium px-1.5 py-0.5 rounded-md",
                              job.channel === "Resend"
                                ? "bg-purple-100 text-purple-600"
                                : "bg-emerald-100 text-emerald-600"
                            )}
                          >
                            {job.channel === "Resend" ? "Resend" : "SMTP"}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5">{meta.description}</p>
                      </div>
                    </div>

                    {/* Next run + Toggle + Trigger */}
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                      {job.paused && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-200/70 text-amber-700 font-medium">
                          Paused
                        </span>
                      )}
                      {job.next_run_time && !job.paused && (
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

                      {/* Pause/Resume toggle */}
                      <button
                        onClick={() => handleToggle(job.id)}
                        disabled={!!togglingId}
                        className={cn(
                          "relative w-10 h-[22px] rounded-full transition-colors shrink-0",
                          job.paused ? "bg-amber-300" : "bg-emerald-500"
                        )}
                        title={job.paused ? "Resume job" : "Pause job"}
                      >
                        <span
                          className={cn(
                            "absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform",
                            job.paused ? "left-[2px]" : "left-[20px]"
                          )}
                        />
                        {togglingId === job.id && (
                          <Loader2 className="absolute inset-0 m-auto w-3 h-3 animate-spin text-white/70" />
                        )}
                      </button>

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

                  {/* ── Row 2: Trigger Options (always visible for triggerable jobs) ── */}
                  {job.triggerable && (() => {
                    const opts = triggerOptions[job.id] || { skip_quiet_hours: false, force_email: false, skip_dedup: false };
                    const setOpt = (key: string, val: boolean) =>
                      setTriggerOptions((prev) => ({ ...prev, [job.id]: { ...opts, [key]: val } }));
                    const hasActive = opts.skip_quiet_hours || opts.force_email || opts.skip_dedup;
                    return (
                      <div className={cn(
                        "flex items-center gap-1 sm:gap-1.5 px-4 pb-3 pt-0 flex-wrap",
                      )}>
                        <span className="text-[10px] text-neutral-300 uppercase tracking-wider font-semibold mr-1 select-none">
                          Opsi
                        </span>
                        {[
                          { key: "skip_quiet_hours", label: "Skip Quiet Hours" },
                          { key: "force_email", label: "Force Email" },
                          { key: "skip_dedup", label: "Skip Dedup" },
                        ].map(({ key, label }) => {
                          const on = (opts as Record<string, boolean>)[key];
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setOpt(key, !on)}
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all select-none border",
                                on
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-neutral-50 text-neutral-400 border-neutral-100 hover:border-neutral-200 hover:text-neutral-500"
                              )}
                            >
                              <span className={cn(
                                "w-2.5 h-2.5 rounded-[3px] border-[1.5px] flex items-center justify-center transition-colors",
                                on ? "bg-blue-600 border-blue-600" : "border-neutral-300 bg-white"
                              )}>
                                {on && (
                                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                              </span>
                              {label}
                            </button>
                          );
                        })}
                        {hasActive && (
                          <button
                            type="button"
                            onClick={() => setTriggerOptions((prev) => {
                              const next = { ...prev };
                              delete next[job.id];
                              return next;
                            })}
                            className="text-[10px] text-neutral-400 hover:text-red-500 ml-1 transition-colors"
                            title="Reset semua opsi"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    );
                  })()}
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

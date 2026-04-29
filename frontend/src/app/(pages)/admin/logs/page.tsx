"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  LogIn,
  CheckCircle2,
  Award,
  Play,
  Snowflake,
  Target,
  Move,
  ArrowUpDown,
  UserPlus,
  Loader2,
  AlertCircle,
  Trash2,
  PenLine,
  Settings2,
  Sparkles,
  CalendarClock,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface LogEntry {
  _id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  action_type: string;
  description: string;
  created_at: string;
}

interface LogsResponse {
  data: LogEntry[];
  total: number;
  page: number;
  per_page: number;
}

const ACTION_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  session_start: { label: "Login", icon: LogIn, color: "text-blue-600 bg-blue-50" },
  onboarding_started: { label: "Register", icon: UserPlus, color: "text-emerald-600 bg-emerald-50" },
  session_end: { label: "Logout", icon: LogIn, color: "text-neutral-600 bg-neutral-100" },
  task_done: { label: "Task Done", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
  card_moved: { label: "Card Moved", icon: Move, color: "text-blue-600 bg-blue-50" },
  badge_unlocked: { label: "Badge", icon: Award, color: "text-amber-600 bg-amber-50" },
  study_session_started: { label: "Study Start", icon: Play, color: "text-blue-600 bg-blue-50" },
  study_session_completed: { label: "Study Done", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
  session_auto_ended: { label: "Auto-ended", icon: CalendarClock, color: "text-neutral-500 bg-neutral-100" },
  session_completed: { label: "Study Done", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
  reflection_completed: { label: "Reflection", icon: PenLine, color: "text-purple-600 bg-purple-50" },
  streak_freeze_used: { label: "Streak Freeze", icon: Snowflake, color: "text-blue-600 bg-blue-50" },
  goal_set: { label: "Goal Set", icon: Target, color: "text-primary bg-primary/10" },
  task_created: { label: "Task Created", icon: Sparkles, color: "text-emerald-600 bg-emerald-50" },
  task_deleted: { label: "Task Deleted", icon: Trash2, color: "text-red-600 bg-red-50" },
  strategy_used: { label: "Strategy", icon: Settings2, color: "text-purple-600 bg-purple-50" },
  grade_updated: { label: "Grade", icon: Flag, color: "text-amber-600 bg-amber-50" },
  onboarding_completed: { label: "Onboarding Done", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
};

const ALL_ACTIONS = Object.keys(ACTION_META);

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");

  const fetchLogs = useCallback(async (action = "all", q = "") => {
    setLoading(true);
    setError(null);
    try {
      let url = "/admin/logs?page=1&per_page=100";
      if (action !== "all") url += `&action=${encodeURIComponent(action)}`;
      if (q) url += `&search=${encodeURIComponent(q)}`;
      const res = await api.get<LogsResponse>(url);
      setLogs(res.data);
      setTotal(res.total);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal memuat logs";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearch = (value: string) => {
    setSearch(value);
    fetchLogs(filterAction, value);
  };

  const handleFilterAction = (value: string) => {
    setFilterAction(value);
    fetchLogs(value, search);
  };

  const filtered = useMemo(() => {
    if (filterAction !== "all") {
      return logs;
    }
    return logs;
  }, [logs, filterAction]);

  return (
    <div className="mx-auto space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-neutral-800">Activity Logs</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Riwayat aktivitas semua user</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari nama, email, atau deskripsi..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pr-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            style={{ paddingLeft: "36px" }}
          />
        </div>
        <select
          value={filterAction}
          onChange={(e) => handleFilterAction(e.target.value)}
          className="px-3 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-neutral-700"
        >
          <option value="all">Semua Aksi</option>
          {ALL_ACTIONS.map((action) => (
            <option key={action} value={action}>
              {ACTION_META[action].label}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          Memuat logs...
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => fetchLogs(filterAction, search)} className="ml-auto underline text-red-700 hover:text-red-800 text-xs">
            Coba lagi
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-lg border border-neutral-200 divide-y divide-neutral-100">
          {filtered.map((log) => {
            const meta = ACTION_META[log.action_type] ?? {
              label: log.action_type.replace(/_/g, " "),
              icon: ArrowUpDown,
              color: "text-neutral-600 bg-neutral-100",
            };
            const Icon = meta.icon;
            const displayName = log.user_name || log.user_email || log.user_id;
            return (
              <div
                key={log._id}
                className="flex items-start gap-3 px-4 py-3 hover:bg-neutral-50/60 transition-colors"
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5",
                    meta.color
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/users/${log.user_id}`}
                      className="text-sm font-medium text-neutral-800 hover:text-primary transition-colors"
                    >
                      {displayName}
                    </Link>
                    <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded", meta.color)}>
                      {meta.label}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">{log.description}</p>
                </div>
                <span className="text-xs text-neutral-400 whitespace-nowrap shrink-0 mt-0.5">
                  {fmtDateTime(log.created_at)}
                </span>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-neutral-400">
              Tidak ada log ditemukan
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-neutral-400 text-center">
        Menampilkan {filtered.length} dari {total} log
      </p>
    </div>
  );
}

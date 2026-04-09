"use client";

import React, { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface LogEntry {
  _id: string;
  user_id: string;
  username: string;
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

const ACTION_META: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  login: { label: "Login", icon: LogIn, color: "text-blue-600 bg-blue-50" },
  register: { label: "Register", icon: UserPlus, color: "text-emerald-600 bg-emerald-50" },
  card_done: { label: "Task Done", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
  card_move: { label: "Card Moved", icon: Move, color: "text-blue-600 bg-blue-50" },
  badge_unlock: { label: "Badge", icon: Award, color: "text-amber-600 bg-amber-50" },
  session_start: { label: "Session", icon: Play, color: "text-blue-600 bg-blue-50" },
  session_end: { label: "Session End", icon: CheckCircle2, color: "text-neutral-600 bg-neutral-100" },
  reflection: { label: "Reflection", icon: CheckCircle2, color: "text-purple-600 bg-purple-50" },
  streak_freeze: { label: "Streak Freeze", icon: Snowflake, color: "text-blue-600 bg-blue-50" },
  goal_set: { label: "Goal Set", icon: Target, color: "text-primary bg-primary/10" },
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

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<LogsResponse>("/admin/logs?page=1&per_page=100");
      setLogs(res.data);
      setTotal(res.total);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal memuat logs";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return logs
      .filter((log) => {
        if (filterAction !== "all" && log.action_type !== filterAction) return false;
        if (q) {
          const userName = log.username || log.user_id || "";
          return (
            userName.toLowerCase().includes(q) ||
            log.description.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [logs, search, filterAction]);

  return (
    <div className="mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-neutral-800">
          Activity Logs
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Riwayat aktivitas semua user
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari user atau deskripsi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            style={{ paddingLeft: "36px" }}
          />
        </div>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
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

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          Memuat logs...
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={fetchLogs} className="ml-auto underline text-red-700 hover:text-red-800 text-xs">
            Coba lagi
          </button>
        </div>
      )}

      {/* Logs list */}
      {!loading && !error && (
        <div className="bg-white rounded-lg border border-neutral-200 divide-y divide-neutral-100">
          {filtered.map((log) => {
            const meta = ACTION_META[log.action_type] ?? {
              label: log.action_type,
              icon: ArrowUpDown,
              color: "text-neutral-600 bg-neutral-100",
            };
            const Icon = meta.icon;
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
                      {log.username || log.user_id}
                    </Link>
                    <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded", meta.color)}>
                      {meta.label}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {log.description}
                  </p>
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

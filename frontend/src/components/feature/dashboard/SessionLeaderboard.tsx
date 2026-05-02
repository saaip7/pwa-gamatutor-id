"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Crown, Medal, Zap } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

/* ── Types ─────────────────────────────────────────── */

interface TopSession {
  rank: number;
  session_id: string;
  task_name: string;
  course_name: string;
  duration_sec: number;
  date: string;
}

/* ── Helpers ───────────────────────────────────────── */

function formatDuration(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}j`;
  return `${h}j ${m}m`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

/* ── Rank Badge ────────────────────────────────────── */

function RankBadge({ rank }: { rank: number }) {
  const config = {
    1: {
      bg: "from-amber-400 to-yellow-500",
      shadow: "shadow-[0_2px_10px_-1px_rgba(251,191,36,0.55)]",
      icon: <Crown className="w-3 h-3 text-amber-900/80" />,
    },
    2: {
      bg: "from-neutral-300 to-neutral-400",
      shadow: "shadow-[0_2px_8px_-1px_rgba(163,163,163,0.45)]",
      icon: <Medal className="w-3 h-3 text-neutral-600" />,
    },
    3: {
      bg: "from-orange-300 to-amber-600",
      shadow: "shadow-[0_2px_8px_-1px_rgba(194,120,56,0.45)]",
      icon: <Medal className="w-3 h-3 text-orange-100" />,
    },
  } as const;

  const c = config[rank as 1 | 2 | 3];
  if (!c) return null;

  return (
    <div
      className={cn(
        "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0",
        c.bg, c.shadow
      )}
    >
      {c.icon}
    </div>
  );
}

/* ── Empty State ───────────────────────────────────── */

function EmptyState() {
  return (
    <div className="py-6 flex flex-col items-center gap-2">
      <div className="w-10 h-10 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center">
        <Zap className="w-4.5 h-4.5 text-neutral-300" />
      </div>
      <p className="text-xs text-neutral-400 text-center leading-relaxed">
        Selesaikan minimal 1 sesi untuk lihat personal best
      </p>
    </div>
  );
}

/* ── Main Component ────────────────────────────────── */

export function SessionLeaderboard({ className }: { className?: string }) {
  const [sessions, setSessions] = useState<TopSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTopSessions = useCallback(async () => {
    try {
      const res = await api.get<{ sessions: TopSession[] }>(
        "/api/study-sessions/top"
      );
      setSessions(res.sessions);
    } catch {
      // silent fail — leaderboard is non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopSessions();
  }, [fetchTopSessions]);

  return (
    <div
      className={cn("anim-fade-in-up", className)}
      style={{ animationDelay: "0.4s" }}
    >
      <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] border border-neutral-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Medal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-800 tracking-tight">
                Personal Best
              </h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                3 sesi terlama kamu
              </p>
            </div>
          </div>
          <Link
            href="/account/sessions"
            className="text-sm font-bold text-primary flex items-center gap-1 hover:text-primary-hover transition-colors"
          >
            Lihat semua
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-xl p-3 bg-neutral-50/50 border border-neutral-100/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-neutral-200/60" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 rounded bg-neutral-200/60 w-2/3" />
                    <div className="h-3 rounded bg-neutral-200/40 w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => {
              const isTop = s.rank === 1;
              return (
                <div
                  key={s.session_id}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all duration-200 group",
                    "hover:-translate-y-px hover:shadow-sm",
                    isTop
                      ? "bg-gradient-to-r from-amber-50/80 via-amber-50/40 to-transparent border border-amber-200/40"
                      : "bg-neutral-50/60 border border-neutral-100/60"
                  )}
                >
                  <RankBadge rank={s.rank} />

                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-[13px] font-semibold truncate leading-tight",
                      isTop ? "text-neutral-900" : "text-neutral-700"
                    )}>
                      {s.task_name}
                    </p>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                      {s.course_name || "Tanpa mata kuliah"} · {formatDate(s.date)}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className={cn(
                      "text-sm font-bold tabular-nums",
                      isTop ? "text-amber-700" : "text-neutral-600"
                    )}>
                      {formatDuration(s.duration_sec)}
                    </span>
                    {isTop && (
                      <p className="text-[9px] font-bold uppercase tracking-widest text-amber-500 mt-px">
                        Best
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

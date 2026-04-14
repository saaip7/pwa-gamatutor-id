"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Bell, Award, Users, CalendarClock, Lightbulb, Trash2, Check } from "lucide-react";
import { NotificationHeader } from "@/components/feature/notifications/NotificationHeader";
import { useNotificationsStore } from "@/stores/notifications";
import type { Notification } from "@/types";
import { cn } from "@/lib/utils";

type NotificationType = "award" | "social" | "reminder" | "insight";

const ICON_CONFIG: Record<string, { icon: typeof Award; bg: string; text: string }> = {
  award: { icon: Award, bg: "bg-blue-100", text: "text-blue-600" },
  social: { icon: Users, bg: "bg-indigo-100", text: "text-indigo-600" },
  reminder: { icon: CalendarClock, bg: "bg-amber-100", text: "text-amber-600" },
  insight: { icon: Lightbulb, bg: "bg-emerald-100", text: "text-emerald-600" },
};

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  if (diffMs < 0) return "Baru saja";

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes}m lalu`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}j lalu`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Kemarin";
  if (days < 7) return `${days}h lalu`;

  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export default function NotificationPage() {
  const notifications = useNotificationsStore((s) => s.notifications);
  const loading = useNotificationsStore((s) => s.loading);
  const hasMore = useNotificationsStore((s) => s.hasMore);
  const fetchNotifications = useNotificationsStore((s) => s.fetchNotifications);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const deleteNotification = useNotificationsStore((s) => s.deleteNotification);

  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const initialFetched = useRef(false);

  // Fetch on mount
  useEffect(() => {
    if (!initialFetched.current) {
      initialFetched.current = true;
      fetchNotifications(1);
    }
  }, [fetchNotifications]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!hasMore || loading) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const nextPage = page + 1;
          fetchNotifications(nextPage).then(() => setPage(nextPage));
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, page, fetchNotifications]);

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="w-full h-screen bg-neutral-50 flex flex-col mx-auto overflow-hidden relative max-w-md">
      <NotificationHeader />

      <main className="flex-1 overflow-y-auto no-scrollbar pt-4 pb-[34px]">
        {/* Loading state — initial load */}
        {loading && notifications.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
              <Bell className="w-7 h-7 text-neutral-300" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-neutral-700 mb-1">Belum ada notifikasi</p>
            <p className="text-xs text-neutral-400">Notifikasi terbaru akan muncul di sini.</p>
          </div>
        )}

        {/* Mark all read button */}
        {hasUnread && notifications.length > 0 && (
          <div className="px-5 pb-3 flex justify-end">
            <button
              onClick={() => markAllRead()}
              className="text-[11px] font-bold text-primary hover:text-primary/80 active:scale-95 transition-all"
            >
              Tandai semua dibaca
            </button>
          </div>
        )}

        {/* Single flat list */}
        {notifications.length > 0 && (
          <div className="mx-5 bg-white rounded-[24px] border border-neutral-100 shadow-sm overflow-hidden">
            {notifications.map((n, idx) => {
              const config = ICON_CONFIG[n.type] || ICON_CONFIG.insight;
              const Icon = config.icon;
              const isLast = idx === notifications.length - 1;

              return (
                <motion.div
                  key={n._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                  className={cn(
                    "flex items-start gap-3.5 p-4 relative group",
                    !n.read ? "bg-blue-50/40" : "bg-white",
                    !isLast && "border-b border-neutral-100"
                  )}
                >
                  {/* Icon */}
                  <div className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center shrink-0",
                    config.bg, config.text
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <h4 className="text-sm font-semibold text-neutral-900 leading-tight truncate">
                        {n.title}
                      </h4>
                      <span className={cn(
                        "text-[10px] font-medium whitespace-nowrap mt-0.5 shrink-0",
                        !n.read ? "text-primary" : "text-neutral-400"
                      )}>
                        {formatRelativeTime(n.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 leading-snug">
                      {n.description}
                    </p>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3 mt-2">
                      {!n.read && (
                        <button
                          onClick={() => markRead(n._id)}
                          className="flex items-center gap-1 text-[10px] font-bold text-primary hover:text-primary/80 active:scale-95 transition-all"
                        >
                          <Check className="w-3 h-3" />
                          Baca
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(n._id)}
                        className="flex items-center gap-1 text-[10px] font-bold text-neutral-400 hover:text-red-500 active:scale-95 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                        Hapus
                      </button>
                    </div>
                  </div>

                  {/* Unread dot */}
                  {!n.read && (
                    <div className="absolute right-4 top-4 w-2 h-2 rounded-full bg-primary shadow-[0_0_0_4px_rgba(59,130,246,0.15)]"></div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Infinite scroll sentinel + loading indicator for next pages */}
        <div ref={sentinelRef} className="h-1" />
        {loading && notifications.length > 0 && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
        )}

        <div className="h-4" />
      </main>
    </div>
  );
}

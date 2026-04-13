"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Bell } from "lucide-react";
import { NotificationHeader } from "@/components/feature/notifications/NotificationHeader";
import { NotificationItem, NotificationType } from "@/components/feature/notifications/NotificationItem";
import { useNotificationsStore } from "@/stores/notifications";
import type { Notification } from "@/types";

// Simple relative-time formatter (no external lib needed)
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

  // Older than a week — show date
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

// Split notifications into "Terbaru" (today-ish, within 24h) and "Sebelumnya"
function categorize(notifications: Notification[]) {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const terbaru: Notification[] = [];
  const sebelumnya: Notification[] = [];

  for (const n of notifications) {
    const age = now - new Date(n.created_at).getTime();
    if (age < DAY) {
      terbaru.push(n);
    } else {
      sebelumnya.push(n);
    }
  }
  return { terbaru, sebelumnya };
}

export default function NotificationPage() {
  const notifications = useNotificationsStore((s) => s.notifications);
  const loading = useNotificationsStore((s) => s.loading);
  const hasMore = useNotificationsStore((s) => s.hasMore);
  const fetchNotifications = useNotificationsStore((s) => s.fetchNotifications);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);

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

  const handleMarkAllRead = async () => {
    await markAllRead();
  };

  const handleMarkRead = async (id: string) => {
    await markRead(id);
  };

  const { terbaru, sebelumnya } = categorize(notifications);
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="w-full h-screen bg-neutral-50 flex flex-col mx-auto overflow-hidden relative max-w-md">
      <NotificationHeader />

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pt-6 pb-[34px] space-y-7">
        {/* Loading state — initial load */}
        {loading && notifications.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
              <Bell className="w-7 h-7 text-neutral-300" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-neutral-700 mb-1">Belum ada notifikasi</p>
            <p className="text-xs text-neutral-400">Notifikasi terbaru akan muncul di sini.</p>
          </div>
        )}

        {/* TERBARU SECTION */}
        {terbaru.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-bold text-neutral-400 tracking-wider uppercase">
                Terbaru
              </h3>
              {hasUnread && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-bold text-primary hover:text-primary/80 active:scale-95 transition-all"
                >
                  Tandai dibaca
                </button>
              )}
            </div>

            <div className="bg-white rounded-[24px] border border-neutral-100 shadow-sm overflow-hidden">
              {terbaru.map((n, idx) => (
                <NotificationItem
                  key={n._id}
                  type={n.type as NotificationType}
                  title={n.title}
                  description={n.description}
                  time={formatRelativeTime(n.created_at)}
                  isUnread={!n.read}
                  isLast={idx === terbaru.length - 1}
                  onClick={() => handleMarkRead(n._id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* SEBELUMNYA SECTION */}
        {sebelumnya.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-400 tracking-wider uppercase px-2">
              Sebelumnya
            </h3>

            <div className="bg-white rounded-[24px] border border-neutral-100 shadow-sm overflow-hidden">
              {sebelumnya.map((n, idx) => (
                <NotificationItem
                  key={n._id}
                  type={n.type as NotificationType}
                  title={n.title}
                  description={n.description}
                  time={formatRelativeTime(n.created_at)}
                  isUnread={!n.read}
                  isLast={idx === sebelumnya.length - 1}
                  onClick={() => handleMarkRead(n._id)}
                />
              ))}
            </div>
          </section>
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

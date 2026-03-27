"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationHeader } from "@/components/feature/notifications/NotificationHeader";
import { NotificationItem, NotificationType } from "@/components/feature/notifications/NotificationItem";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  isUnread: boolean;
  group: "terbaru" | "sebelumnya";
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "award",
    title: "Badge Baru Terbuka!",
    description: "Kamu meraih 'The Strategist'. Lihat koleksimu!",
    time: "15m lalu",
    isUnread: true,
    group: "terbaru"
  },
  {
    id: "2",
    type: "social",
    title: "Teman Belajar",
    description: "5 temanmu sedang aktif belajar sekarang. Yuk mulai sesi fokus!",
    time: "1j lalu",
    isUnread: true,
    group: "terbaru"
  },
  {
    id: "3",
    type: "reminder",
    title: "Deadline Mendatang",
    description: "Tugas 'UTS Algoritma' harus selesai besok jam 14:00.",
    time: "3j lalu",
    isUnread: false,
    group: "sebelumnya"
  },
  {
    id: "4",
    type: "insight",
    title: "Insight Produktif",
    description: "Kamu paling produktif di malam hari. Waktunya menyusun rencana besok?",
    time: "Kemarin",
    isUnread: false,
    group: "sebelumnya"
  }
];

export default function NotificationPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isUnread: false } : n));
  };

  const latestNotifs = notifications.filter(n => n.group === "terbaru");
  const previousNotifs = notifications.filter(n => n.group === "sebelumnya");

  return (
    <div className="w-full h-screen bg-neutral-50 flex flex-col mx-auto overflow-hidden relative max-w-md">
      <NotificationHeader />

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pt-6 pb-[34px] space-y-7">
        
        {/* TERBARU SECTION */}
        {latestNotifs.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-bold text-neutral-400 tracking-wider uppercase">
                Terbaru
              </h3>
              <button 
                onClick={markAllAsRead}
                className="text-[11px] font-bold text-primary hover:text-primary/80 active:scale-95 transition-all"
              >
                Tandai dibaca
              </button>
            </div>
            
            <div className="bg-white rounded-[24px] border border-neutral-100 shadow-sm overflow-hidden">
              {latestNotifs.map((n, idx) => (
                <NotificationItem
                  key={n.id}
                  {...n}
                  isLast={idx === latestNotifs.length - 1}
                  onClick={() => markAsRead(n.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* SEBELUMNYA SECTION */}
        {previousNotifs.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-400 tracking-wider uppercase px-2">
              Sebelumnya
            </h3>
            
            <div className="bg-white rounded-[24px] border border-neutral-100 shadow-sm overflow-hidden">
              {previousNotifs.map((n, idx) => (
                <NotificationItem
                  key={n.id}
                  {...n}
                  isLast={idx === previousNotifs.length - 1}
                  onClick={() => markAsRead(n.id)}
                />
              ))}
            </div>
          </section>
        )}
        
        <div className="h-4" />
      </main>
    </div>
  );
}

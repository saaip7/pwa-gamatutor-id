"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Quote } from "lucide-react";
import Link from "next/link";

const MOTIVATIONAL_QUOTES = [
  "Belajar adalah maraton, bukan sprint. Istirahatlah jika lelah.",
  "Setiap langkah kecil membawamu lebih dekat ke tujuan.",
  "Konsistensi kecil lebih kuat daripada semangat sesaat.",
  "Kesalahan adalah bukti bahwa kamu sedang mencoba.",
  "Proses belajarmu hari ini investasi untuk masa depanmu.",
  "Tidak ada yang terlambat untuk mulai belajar sesuatu yang baru.",
  "Fokus pada progres, bukan kesempurnaan.",
  "Hari ini sulit, besok lebih baik. Teruslah berjalan.",
  "Belajar terbaik adalah belajar dari kegagalan.",
  "Kamu tidak perlu sempurna, kamu hanya perlu terus berusaha.",
  "Satu halaman yang dibaca lebih baik daripada nol.",
  "Disiplin diri adalah jembatan antara tujuan dan pencapaian.",
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 11) return "Selamat Pagi";
  if (hour >= 11 && hour < 15) return "Selamat Siang";
  if (hour >= 15 && hour < 18) return "Selamat Sore";
  return "Selamat Malam";
}

interface DashboardHeaderProps {
  userName: string;
  hasUnreadNotifications?: boolean;
}

export function DashboardHeader({ userName, hasUnreadNotifications = false }: DashboardHeaderProps) {
  const [quote] = useState(
    () => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
  );

  const greeting = getGreeting();

  return (
    <div className="pt-12 pb-6 px-6 relative shrink-0">
      <motion.div
        className="flex justify-between items-center relative z-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex flex-col">
          <p className="text-sm font-medium text-neutral-500 mb-0.5">{greeting},</p>
          <h1 className="text-lg md:text-xl font-bold text-neutral-900 tracking-tight leading-none">
            {userName}!
          </h1>
        </div>

        <Link
          href="/notifications"
          className="w-11 h-11 rounded-full border border-neutral-200 bg-white flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition-colors relative shadow-sm active:scale-95"
        >
          <Bell className="w-[22px] h-[22px]" />
          {hasUnreadNotifications && (
            <span className="absolute top-[11px] right-[11px] w-2 h-2 bg-error rounded-full border-[1.5px] border-white"></span>
          )}
        </Link>
      </motion.div>

      {/* Motivational Quote */}
      <motion.div
        className="mt-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-start gap-2.5">
          <Quote className="text-primary/40 w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-neutral-600 text-sm leading-relaxed italic font-medium">
            {quote}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

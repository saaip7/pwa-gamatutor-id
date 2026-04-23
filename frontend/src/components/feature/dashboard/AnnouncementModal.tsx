"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, X } from "lucide-react";
import { api } from "@/lib/api";



interface ActiveAnnouncement {
  _id: string;
  title: string;
  body: string;
}

export function AnnouncementModal() {
  const [announcements, setAnnouncements] = useState<ActiveAnnouncement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await api.get<{ announcements: ActiveAnnouncement[] }>(
        `/api/announcements`
      );
      if (res.announcements.length > 0) {
        setAnnouncements(res.announcements);
        setTimeout(() => setIsVisible(true), 600);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleDismiss = async () => {
    const current = announcements[currentIndex];
    if (!current) return;
    setDismissing(true);
    try {
      await api.put(`/api/announcements/${current._id}/dismiss`);
    } catch {
      // still close modal even if API fails
    }
    setDismissing(false);

    if (currentIndex + 1 < announcements.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      setIsVisible(false);
    }
  };

  if (!isVisible || announcements.length === 0) return null;

  const current = announcements[currentIndex];

  return (
    <AnimatePresence>
      {isVisible && current && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 pb-[calc(80px+env(safe-area-inset-bottom))] pt-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
            onClick={dismissing ? undefined : handleDismiss}
          />
          <motion.div
            key={current._id}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-[81]"
          >
            <div className="px-5 pt-5 pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                    <Megaphone className="w-4.5 h-4.5 text-amber-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">Pengumuman</span>
                    <h2 className="text-base font-bold text-neutral-900 tracking-tight leading-tight">{current.title}</h2>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="w-8 h-8 flex items-center justify-center bg-neutral-50 hover:bg-neutral-100 active:bg-neutral-200 rounded-full text-neutral-400 transition-colors shrink-0 mt-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="px-5 pb-2">
              <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">{current.body}</p>
            </div>
            <div className="px-5 pb-5 pt-3">
              <button
                onClick={handleDismiss}
                disabled={dismissing}
                className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white text-sm font-medium rounded-xl transition-colors"
              >
                {dismissing ? "Menutup..." : "Mengerti"}
              </button>
              {announcements.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-2.5">
                  {announcements.map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentIndex ? "bg-neutral-800" : "bg-neutral-200"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

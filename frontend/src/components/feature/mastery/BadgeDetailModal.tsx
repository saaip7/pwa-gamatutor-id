"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { MasteryBadgeIcon, type BadgeShape } from "./MasteryBadgeIcon";
import { MasterySVGDefs } from "./MasterySVGDefs";
import type { LucideIcon } from "lucide-react";

interface BadgeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: {
    name: string;
    description: string;
    celebration_message?: string;
    shape: BadgeShape;
    icon: LucideIcon;
    unlocked_at?: string;
    category: string;
  } | null;
}

const CATEGORY_ACCENT: Record<string, { bg: string; text: string; ring: string; glow: string; label: string }> = {
  foundation: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
    glow: "shadow-emerald-200/60",
    label: "Foundation",
  },
  performance: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-200",
    glow: "shadow-amber-200/60",
    label: "Performance",
  },
  mindset: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    ring: "ring-indigo-200",
    glow: "shadow-indigo-200/60",
    label: "Mindset",
  },
  mastery: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-200",
    glow: "shadow-blue-200/60",
    label: "Mastery",
  },
};

function formatUnlockedDate(isoString?: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function BadgeDetailModal({ isOpen, onClose, badge }: BadgeDetailModalProps) {
  if (!badge) return null;

  const accent = CATEGORY_ACCENT[badge.category] || CATEGORY_ACCENT.foundation;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
          onClick={onClose}
        >
          <MasterySVGDefs />

          {/* Backdrop */}
          <div className="absolute inset-0 bg-neutral-900/30 backdrop-blur-sm" />

          {/* Modal Card */}
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-sm mx-4 mb-6 sm:mb-0 bg-white rounded-3xl shadow-2xl overflow-hidden ring-1 ring-neutral-100"
          >
            {/* Top accent bar */}
            <div className={cn("h-1.5 w-full", accent.bg.replace("bg-", "bg-").replace("50", "400"))} />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors z-20"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="px-7 pt-8 pb-8 flex flex-col items-center text-center">
              {/* Category label */}
              <span className={cn(
                "text-[11px] font-bold uppercase tracking-widest mb-5 px-3 py-1 rounded-full",
                accent.bg,
                accent.text
              )}>
                {accent.label}
              </span>

              {/* Large Badge Icon */}
              <motion.div
                initial={{ scale: 0.6, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                className={cn(
                  "w-[140px] h-[140px] mb-6 rounded-full ring-4",
                  accent.ring,
                  "shadow-xl",
                  accent.glow
                )}
              >
                <MasteryBadgeIcon
                  shape={badge.shape}
                  icon={badge.icon}
                  iconClassName="[&>svg]:w-[56px] [&>svg]:h-[56px]"
                />
              </motion.div>

              {/* Badge Name */}
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-2xl font-bold text-neutral-900 tracking-tight mb-1"
              >
                {badge.name}
              </motion.h2>

              {/* Short description */}
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-neutral-400 font-medium mb-5"
              >
                {badge.description}
              </motion.p>

              {/* Divider */}
              <div className="w-12 h-0.5 rounded-full bg-neutral-100 mb-5" />

              {/* Celebration message */}
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-sm text-neutral-600 leading-relaxed mb-6"
              >
                {badge.celebration_message || badge.description}
              </motion.p>

              {/* Unlocked date */}
              {badge.unlocked_at && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="flex items-center gap-1.5 text-xs text-neutral-400"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Terbuka pada {formatUnlockedDate(badge.unlocked_at)}</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

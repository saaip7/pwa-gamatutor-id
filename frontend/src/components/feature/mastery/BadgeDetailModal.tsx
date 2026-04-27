"use client";

import React, { useRef } from "react";
import { X, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { MasteryBadgeIcon, type BadgeShape } from "./MasteryBadgeIcon";
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
  const lastBadgeRef = useRef(badge);

  // Keep last non-null badge so exit animation can finish with content intact
  if (badge) {
    lastBadgeRef.current = badge;
  }

  const displayBadge = badge || lastBadgeRef.current;

  if (!displayBadge) return null;

  const accent = CATEGORY_ACCENT[displayBadge.category] || CATEGORY_ACCENT.foundation;

  return (
    <div
      data-state={isOpen ? "open" : "closed"}
      className="badge-modal-wrap fixed inset-0 z-[60] flex items-end sm:items-center justify-center data-[state=closed]:pointer-events-none"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="badge-modal-backdrop absolute inset-0 bg-neutral-900/30 backdrop-blur-sm" />

      {/* Modal Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "badge-modal-card relative z-10 w-full max-w-sm mx-4 mb-6 sm:mb-0 bg-white rounded-3xl shadow-2xl overflow-hidden ring-1 ring-neutral-100"
        )}
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
          <span
            className={cn(
              "text-[11px] font-bold uppercase tracking-widest mb-5 px-3 py-1 rounded-full",
              accent.bg,
              accent.text
            )}
          >
            {accent.label}
          </span>

          {/* Large Badge Icon */}
          <div
            className={cn(
              "badge-modal-icon-wrap w-[140px] h-[140px] mb-6 rounded-full ring-4",
              accent.ring,
              "shadow-xl",
              accent.glow
            )}
          >
            <MasteryBadgeIcon
              shape={displayBadge.shape}
              icon={displayBadge.icon}
              iconClassName="[&>svg]:w-[56px] [&>svg]:h-[56px]"
            />
          </div>

          {/* Badge Name */}
          <h2 className="badge-modal-title text-2xl font-bold text-neutral-900 tracking-tight mb-1">
            {displayBadge.name}
          </h2>

          {/* Short description */}
          <p className="badge-modal-subtitle text-sm text-neutral-400 font-medium mb-5">
            {displayBadge.description}
          </p>

          {/* Divider */}
          <div className="w-12 h-0.5 rounded-full bg-neutral-100 mb-5" />

          {/* Celebration message */}
          <p className="badge-modal-message text-sm text-neutral-600 leading-relaxed mb-6">
            {displayBadge.celebration_message || displayBadge.description}
          </p>

          {/* Unlocked date */}
          {displayBadge.unlocked_at && (
            <div className="badge-modal-date flex items-center gap-1.5 text-xs text-neutral-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>Terbuka pada {formatUnlockedDate(displayBadge.unlocked_at)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

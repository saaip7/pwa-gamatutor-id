"use client";

import React from "react";
import { Award, Users, CalendarClock, Lightbulb, Bell, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export type NotificationType = "award" | "social" | "reminder" | "smart_reminder" | "deadline_reminder" | "streak_nudge" | "insight";

interface NotificationItemProps {
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  isUnread?: boolean;
  isLast?: boolean;
  onClick?: () => void;
}

export function NotificationItem({ 
  type, 
  title, 
  description, 
  time, 
  isUnread, 
  isLast,
  onClick 
}: NotificationItemProps) {
  
  const iconConfig: Record<NotificationType, { icon: typeof Award; bg: string; text: string }> = {
    award: { icon: Award, bg: "bg-blue-100", text: "text-blue-600" },
    social: { icon: Users, bg: "bg-indigo-100", text: "text-indigo-600" },
    reminder: { icon: CalendarClock, bg: "bg-amber-100", text: "text-amber-600" },
    smart_reminder: { icon: Bell, bg: "bg-amber-100", text: "text-amber-600" },
    deadline_reminder: { icon: CalendarClock, bg: "bg-red-100", text: "text-red-600" },
    streak_nudge: { icon: Flame, bg: "bg-orange-100", text: "text-orange-600" },
    insight: { icon: Lightbulb, bg: "bg-emerald-100", text: "text-emerald-600" },
  };

  const { icon: Icon, bg, text } = iconConfig[type];

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3.5 p-4 transition-colors relative group text-left",
        isUnread ? "bg-blue-50/40 hover:bg-blue-50/60" : "bg-white hover:bg-neutral-50/80",
        !isLast && "border-b border-neutral-100"
      )}
    >
      <div className={cn(
        "w-11 h-11 rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform",
        bg,
        text
      )}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0 pr-5">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <h4 className="text-sm font-semibold text-neutral-900 leading-tight truncate">
            {title}
          </h4>
          <span className={cn(
            "text-[10px] font-medium whitespace-nowrap mt-0.5",
            isUnread ? "text-primary" : "text-neutral-400"
          )}>
            {time}
          </span>
        </div>
        <p className="text-xs text-neutral-600 leading-snug">
          {description}
        </p>
      </div>

      {isUnread && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_0_4px_rgba(59,130,246,0.15)]"></div>
      )}
    </button>
  );
}

"use client";

import React from "react";
import { Search, Bell } from "lucide-react";
import Link from "next/link";

interface BoardHeaderProps {
  userName: string;
  activeTasksCount: number;
  hasUnreadNotifications?: boolean;
}

export function BoardHeader({ userName, activeTasksCount, hasUnreadNotifications = false }: BoardHeaderProps) {
  return (
    <header className="shrink-0 pt-14 pb-3 px-5 bg-white border-b border-neutral-200 flex justify-between items-center z-20">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-neutral-800 tracking-tight">Hi, {userName} 👋</h1>
        <span className="text-neutral-500 text-xs font-medium mt-0.5">{activeTasksCount} Active Tasks</span>
      </div>
      <div className="flex items-center gap-3">
        <button className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors">
          <Search className="w-5 h-5" />
        </button>
        <Link 
          href="/notifications" 
          className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors relative"
        >
          <Bell className="w-5 h-5" />
          {hasUnreadNotifications && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-error border-2 border-white"></span>
          )}
        </Link>
      </div>
    </header>
  );
}

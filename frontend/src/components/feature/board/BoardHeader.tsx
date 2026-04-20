import React from "react";
import { Search, Bell } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";

interface BoardHeaderProps {
  userName: string;
  activeTasksCount: number;
  hasUnreadNotifications?: boolean;
}

export function BoardHeader({ userName, activeTasksCount, hasUnreadNotifications = false }: BoardHeaderProps) {
  return (
    <PageHeader
      title="Board"
      subtitle={`${activeTasksCount} Tugas Aktif`}
      rightAction={
        <>
          <button className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <Link
            href="/notifications"
            className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {hasUnreadNotifications && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-error border-2 border-white"></span>
            )}
          </Link>
        </>
      }
    />
  );
}

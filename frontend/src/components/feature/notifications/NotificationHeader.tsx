"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Settings2 } from "lucide-react";

export function NotificationHeader() {
  const router = useRouter();

  return (
    <header className="shrink-0 pt-14 pb-4 px-4 flex items-center justify-between bg-white border-b border-neutral-100 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <button 
        onClick={() => router.back()}
        className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors rounded-full active:bg-neutral-50"
      >
        <ArrowLeft className="text-xl" />
      </button>
      
      <h1 className="text-lg md:text-xl font-bold text-neutral-900 tracking-tight">Notifikasi</h1>
      
      <Link 
        href="/account/notifications"
        className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:text-primary transition-colors rounded-full active:bg-blue-50"
      >
        <Settings2 className="text-xl" />
      </Link>
    </header>
  );
}

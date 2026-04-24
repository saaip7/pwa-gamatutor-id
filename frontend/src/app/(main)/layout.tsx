"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Columns2, Target, BarChart3, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { BottomNavigation } from "@/components/shared/BottomNavigation";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { useAuthStore } from "@/stores/auth";

const navItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Board", href: "/board", icon: Columns2 },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Progress", href: "/progress", icon: BarChart3 },
  { name: "Account", href: "/account", icon: User },
];

function DesktopSidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:border-r lg:border-neutral-200 lg:bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:z-30">
      <div className="px-6 pt-8 pb-6 border-b border-neutral-100">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Image
            src="/icon-512x512-secondary.svg"
            alt="Gamatutor logo"
            width={36}
            height={36}
            className="w-9 h-9 rounded-xl"
            priority
          />
          <span className="text-base font-bold text-neutral-800 tracking-tight">Gamatutor</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-6 pt-4 border-t border-neutral-100">
        <button
          onClick={() => {
            logout().then(() => {
              window.location.href = "/login";
            });
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          Keluar
        </button>
      </div>
    </aside>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="w-full h-screen flex flex-col font-sans text-neutral-800 relative overflow-hidden bg-neutral-50">
        <DesktopSidebar />
        <main className="flex-1 overflow-y-auto relative pb-[90px] lg:pl-64 lg:pb-6">
          <div className="px-0 md:px-10 lg:px-8 xl:px-10 w-full min-h-full bg-neutral-50 relative">
            {children}
          </div>
        </main>
        <BottomNavigation />
      </div>
    </AuthGuard>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Columns2, Target, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Board", href: "/board", icon: Columns2 },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Progress", href: "/progress", icon: BarChart3 },
  { name: "Account", href: "/account", icon: User },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-20 px-2 max-w-screen-sm mx-auto w-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-lg transition-colors",
                isActive ? "text-primary" : "text-neutral-500 hover:text-neutral-800"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive && "fill-primary/10")} />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Users,
  ScrollText,
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  BookOpen,
  Lightbulb,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";

const navItems = [
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/strategies", label: "Strategies", icon: Lightbulb },
  { href: "/admin/logs", label: "Logs", icon: ScrollText },
];

function SidebarContent({
  pathname,
  onNavigate,
  onLogout,
}: {
  pathname: string;
  onNavigate?: () => void;
  onLogout?: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div
        className="h-14 flex items-center gap-2.5 px-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
          <LayoutDashboard className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-sm tracking-tight text-white">
          Gamatutor Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              style={{
                color: active ? "#fff" : "#94a3b8",
                backgroundColor: active ? "rgba(59,130,246,0.15)" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.color = "#60a5fa";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.color = "#94a3b8";
              }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors"
          style={{ color: "#94a3b8" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#f8fafc"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#94a3b8"; }}
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, fetchProfile, token } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const handleLogout = async () => {
    await useAuthStore.getState().logout();
    window.location.href = "/login";
  };

  // Auth guard
  useEffect(() => {
    if (token && !user) {
      fetchProfile().finally(() => setAuthChecked(true));
    } else {
      setAuthChecked(true);
    }
  }, [token, user, fetchProfile]);

  useEffect(() => {
    if (authChecked && (!isAuthenticated || user?.role !== "admin")) {
      router.replace("/login");
    }
  }, [authChecked, isAuthenticated, user, router]);

  // Responsive sidebar
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Show loading while checking auth
  if (!authChecked || !isAuthenticated || user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "#f8f9fa" }}>
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div
      className="flex flex-1 min-h-0 font-sans text-neutral-800 overflow-hidden"
      style={{ background: "#f8f9fa" }}
    >
      {/* Desktop sidebar — always in flow */}
      {isDesktop && (
        <aside
          className="flex flex-col shrink-0"
          style={{ backgroundColor: "#111827", width: "240px", height: "100%" }}
        >
          <SidebarContent pathname={pathname} onLogout={handleLogout} />
        </aside>
      )}

      {/* Mobile sidebar — overlay */}
      {!isDesktop && sidebarOpen && (
        <>
          <div
            className="fixed inset-0"
            style={{ background: "rgba(0,0,0,0.3)", zIndex: 40 }}
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="fixed top-0 left-0 bottom-0 flex flex-col"
            style={{
              backgroundColor: "#111827",
              width: "240px",
              zIndex: 50,
            }}
          >
            <div
              className="flex items-center justify-between px-5 h-14"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                  <LayoutDashboard className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-sm tracking-tight text-white">
                  Gamatutor Admin
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1"
                style={{ color: "#94a3b8" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-3 px-3 space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    style={{
                      color: active ? "#93c5fd" : "#94a3b8",
                      backgroundColor: active ? "rgba(59,130,246,0.15)" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.color = "#60a5fa";
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.color = "#94a3b8";
                    }}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-neutral-200 flex items-center px-4 gap-3 shrink-0">
          {!isDesktop && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-md hover:bg-neutral-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-neutral-500" />
            </button>
          )}

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-neutral-400">Admin</span>
            <span className="text-neutral-300">/</span>
            <span className="font-medium text-neutral-800">
              {pathname === "/admin/users" || pathname.startsWith("/admin/users/")
                ? "Users"
                : pathname === "/admin/courses"
                ? "Courses"
                : pathname === "/admin/strategies"
                ? "Strategies"
                : pathname === "/admin/logs"
                ? "Logs"
                : "Dashboard"}
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search, ChevronRight, Flame, Users, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminStore, type AdminUser } from "@/stores/admin";

const COLUMN_COLORS: Record<string, string> = {
  planning: "bg-[#8CD2FF]/30 text-blue-700",
  monitoring: "bg-blue-100 text-blue-700",
  controlling: "bg-amber-100 text-amber-700",
  reflection: "bg-emerald-100 text-emerald-700",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatRelative(iso: string) {
  const now = new Date();
  const d = new Date(iso);
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  if (diffH < 1) return "Baru saja";
  if (diffH < 24) return `${diffH} jam lalu`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "Kemarin";
  if (diffD < 7) return `${diffD} hari lalu`;
  return formatDate(iso);
}

type SortKey = "name" | "createdAt";

export default function AdminUsersPage() {
  const {
    users,
    usersTotal,
    usersPage,
    usersLoading,
    fetchUsers,
  } = useAdminStore();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch users when page or search changes
  useEffect(() => {
    fetchUsers(1, debouncedSearch);
  }, [fetchUsers, debouncedSearch]);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  // Client-side sort of fetched users
  const sorted = React.useMemo(() => {
    const nonAdmin = users.filter((u) => u.role !== "admin");
    return nonAdmin.sort((a, b) => {
      let va: string, vb: string;
      switch (sortBy) {
        case "name":
          va = (a.name ?? "").toLowerCase();
          vb = (b.name ?? "").toLowerCase();
          break;
        case "createdAt":
          va = a.created_at;
          vb = b.created_at;
          break;
        default:
          return 0;
      }
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [users, sortBy, sortDir]);

  // Summary stats
  const totalUsers = usersTotal;
  const activeToday = users.filter(
    (u) => {
      if (u.role === "admin") return false;
      const d = new Date(u.created_at);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }
  ).length;

  return (
    <div className="mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-neutral-800">Users</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Kelola dan monitor semua mahasiswa
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total Users", value: totalUsers, icon: Users },
          { label: "Registered Today", value: activeToday, icon: Flame, accent: "text-success" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg border border-neutral-200 p-3.5"
          >
            <p className="text-xs text-neutral-500 font-medium">{stat.label}</p>
            <p className={cn("text-xl font-semibold mt-1", stat.accent)}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Cari nama atau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          style={{ paddingLeft: "36px" }}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/60">
                {([
                  ["name", "Nama"],
                  ["createdAt", "Bergabung"],
                ] as [SortKey, string][]).map(([key, label]) => (
                  <th
                    key={key}
                    onClick={() => toggleSort(key)}
                    className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider cursor-pointer hover:text-neutral-800 transition-colors select-none"
                  >
                    {label}
                    {sortBy === key && (
                      <span className="ml-1 text-primary">
                        {sortDir === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                ))}
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {usersLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center">
                    <Loader2 className="w-5 h-5 animate-spin text-neutral-400 mx-auto" />
                  </td>
                </tr>
              )}
              {!usersLoading && sorted.map((user) => (
                <tr
                  key={user._id}
                  className="border-b border-neutral-50 hover:bg-neutral-50/80 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                        {(user.name ?? "?").charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-800 truncate">
                          {user.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-400">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-4 py-3 text-neutral-500 truncate max-w-[200px]">
                    {user.email}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-neutral-100 text-neutral-600"
                    )}>
                      {user.role || "user"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <Link
                      href={`/admin/users/${user._id}`}
                      className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors inline-flex items-center justify-center"
                      style={{ width: "28px", height: "28px" }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {!usersLoading && sorted.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-neutral-400"
                  >
                    Tidak ada user ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-400">
          Menampilkan {sorted.length} dari {usersTotal} users
        </p>
        {usersTotal > 20 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchUsers(usersPage - 1, debouncedSearch)}
              disabled={usersPage <= 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-neutral-200 disabled:opacity-40 hover:bg-neutral-50"
            >
              Prev
            </button>
            <span className="text-sm text-neutral-500">
              Page {usersPage}
            </span>
            <button
              onClick={() => fetchUsers(usersPage + 1, debouncedSearch)}
              disabled={usersPage * 20 >= usersTotal}
              className="px-3 py-1.5 text-sm rounded-lg border border-neutral-200 disabled:opacity-40 hover:bg-neutral-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

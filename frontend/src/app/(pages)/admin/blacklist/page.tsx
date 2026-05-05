"use client";

import React, { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import {
  ShieldBan,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Mail,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BlacklistEntry {
  _id: string;
  email: string;
  reason: string;
  channel: string;
  bounced_at: string;
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminBlacklistPage() {
  const [entries, setEntries] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchBlacklist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ data: BlacklistEntry[]; total: number }>("/admin/blacklist");
      setEntries(res.data ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal memuat blacklist";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlacklist();
  }, [fetchBlacklist]);

  const handleDelete = async (email: string) => {
    if (!confirm(`Hapus ${email} dari blacklist? Email ini akan bisa menerima notifikasi lagi.`)) return;
    setDeleting(email);
    try {
      await api.delete(`/admin/blacklist/${encodeURIComponent(email)}`);
      setEntries((prev) => prev.filter((e) => e.email !== email));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menghapus";
      alert(message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-neutral-800">Email Blacklist</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Email yang pernah bounce dan otomatis di-skip dari pengiriman
          </p>
        </div>
        <button
          onClick={fetchBlacklist}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
        <ShieldBan className="w-4 h-4 shrink-0" />
        <span>
          Email di bawah ini di-skip otomatis dari semua pengiriman (broadcast + scheduler).
          Hapus dari blacklist untuk mengaktifkan kembali.
        </span>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          Memuat blacklist...
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={fetchBlacklist} className="ml-auto underline text-red-700 hover:text-red-800 text-xs">
            Coba lagi
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-lg border border-neutral-200 divide-y divide-neutral-100">
          {entries.map((entry) => (
            <div
              key={entry._id}
              className="flex items-center gap-4 px-4 py-3 hover:bg-neutral-50/60 transition-colors"
            >
              <div className="w-8 h-8 rounded-md bg-red-50 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800 truncate">{entry.email}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn(
                    "text-xs font-medium px-1.5 py-0.5 rounded",
                    entry.channel === "resend"
                      ? "text-purple-600 bg-purple-50"
                      : "text-blue-600 bg-blue-50"
                  )}>
                    {entry.channel || "unknown"}
                  </span>
                  <span className="text-xs text-neutral-400 truncate" title={entry.reason}>
                    {entry.reason || "No reason captured"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="flex items-center gap-1 text-xs text-neutral-400">
                  <Clock className="w-3 h-3" />
                  {fmtDateTime(entry.bounced_at)}
                </span>
                <button
                  onClick={() => handleDelete(entry.email)}
                  disabled={deleting === entry.email}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                    deleting === entry.email
                      ? "text-neutral-300 border-neutral-100 cursor-not-allowed"
                      : "text-red-600 border-red-200 hover:bg-red-50"
                  )}
                >
                  {deleting === entry.email ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                  Hapus
                </button>
              </div>
            </div>
          ))}
          {entries.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-neutral-400">
              Belum ada email yang di-blacklist
            </div>
          )}
        </div>
      )}

      {!loading && !error && entries.length > 0 && (
        <p className="text-xs text-neutral-400 text-center">
          {entries.length} email di-blacklist
        </p>
      )}
    </div>
  );
}

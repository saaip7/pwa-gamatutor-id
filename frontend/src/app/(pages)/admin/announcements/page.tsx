"use client";

import React, { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import {
  Send,
  Megaphone,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Loader2,
} from "lucide-react";

interface AnnouncementItem {
  _id: string;
  title: string;
  body: string;
  is_active: boolean;
  dismissed_count: number;
  created_at: string;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");
  const [pushSaveDb, setPushSaveDb] = useState(false);
  const [pushSending, setPushSending] = useState(false);

  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  const [annCreating, setAnnCreating] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: AnnouncementItem[]; total: number }>(
        "/admin/announcements"
      );
      setAnnouncements(res.data);
      setTotal(res.total);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle.trim() || !pushBody.trim()) return;
    setPushSending(true);
    try {
      await api.post("/admin/announcements/push", {
        title: pushTitle.trim(),
        body: pushBody.trim(),
        save_to_db: pushSaveDb,
      });
      setPushTitle("");
      setPushBody("");
      setPushSaveDb(false);
    } catch {
      // silent
    } finally {
      setPushSending(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annBody.trim()) return;
    setAnnCreating(true);
    try {
      await api.post("/admin/announcements", {
        title: annTitle.trim(),
        body: annBody.trim(),
      });
      setAnnTitle("");
      setAnnBody("");
      fetchAnnouncements();
    } catch {
      // silent
    } finally {
      setAnnCreating(false);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    setTogglingId(id);
    try {
      await api.put(`/admin/announcements/${id}/toggle`, { is_active: !isActive });
      fetchAnnouncements();
    } catch {
      // silent
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await api.delete(`/admin/announcements/${id}`);
      fetchAnnouncements();
    } catch {
      // silent
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 className="text-lg font-semibold text-neutral-800">Push & Pengumuman</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Kirim notifikasi dan kelola pengumuman</p>
      </div>

      {/* Push Notification Form */}
      <div className="rounded-lg border border-neutral-200 p-4" style={{ background: "#fff" }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: "rgba(59,130,246,0.1)" }}>
            <Send className="w-3.5 h-3.5" style={{ color: "#3b82f6" }} />
          </div>
          <span className="text-sm font-medium text-neutral-800">Push Notification</span>
          <span className="text-xs text-neutral-400">ke semua device</span>
        </div>
        <form onSubmit={handleSendPush}>
          <div className="flex items-end gap-3">
            <div style={{ flex: 1, minWidth: 0 }}>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Title</label>
              <input
                type="text"
                value={pushTitle}
                onChange={(e) => setPushTitle(e.target.value)}
                placeholder="Judul notifikasi"
                disabled={pushSending}
                className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-sm outline-none disabled:opacity-50"
                style={{ background: "#f9fafb" }}
              />
            </div>
            <div style={{ flex: 2, minWidth: 0 }}>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Body</label>
              <input
                type="text"
                value={pushBody}
                onChange={(e) => setPushBody(e.target.value)}
                placeholder="Isi pesan notifikasi"
                disabled={pushSending}
                className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-sm outline-none disabled:opacity-50"
                style={{ background: "#f9fafb" }}
              />
            </div>
            <label className="flex items-center gap-1.5 shrink-0 pb-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={pushSaveDb}
                onChange={(e) => setPushSaveDb(e.target.checked)}
                disabled={pushSending}
                className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-neutral-500 whitespace-nowrap">Simpan ke inbox</span>
            </label>
            <button
              type="submit"
              disabled={pushSending || !pushTitle.trim() || !pushBody.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium text-white shrink-0 disabled:opacity-50"
              style={{ background: "#3B82F6" }}
              onMouseEnter={(e) => { if (!pushSending) e.currentTarget.style.background = "#2563eb"; }}
              onMouseLeave={(e) => { if (!pushSending) e.currentTarget.style.background = "#3B82F6"; }}
            >
              {pushSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Kirim
            </button>
          </div>
        </form>
      </div>

      {/* Announcement Form */}
      <div className="rounded-lg border border-neutral-200 p-4" style={{ background: "#fff" }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: "rgba(245,158,11,0.1)" }}>
            <Megaphone className="w-3.5 h-3.5" style={{ color: "#d97706" }} />
          </div>
          <span className="text-sm font-medium text-neutral-800">Pengumuman</span>
          <span className="text-xs text-neutral-400">modal popup saat user buka app</span>
        </div>
        <form onSubmit={handleCreate}>
          <div className="flex items-end gap-3">
            <div style={{ flex: 1, minWidth: 0 }}>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Title</label>
              <input
                type="text"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="Judul pengumuman"
                disabled={annCreating}
                className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-sm outline-none disabled:opacity-50"
                style={{ background: "#f9fafb" }}
              />
            </div>
            <div style={{ flex: 2, minWidth: 0 }}>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Body</label>
              <input
                type="text"
                value={annBody}
                onChange={(e) => setAnnBody(e.target.value)}
                placeholder="Isi pengumuman"
                disabled={annCreating}
                className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-sm outline-none disabled:opacity-50"
                style={{ background: "#f9fafb" }}
              />
            </div>
            <button
              type="submit"
              disabled={annCreating || !annTitle.trim() || !annBody.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium text-white shrink-0 disabled:opacity-50"
              style={{ background: "#d97706" }}
              onMouseEnter={(e) => { if (!annCreating) e.currentTarget.style.background = "#b45309"; }}
              onMouseLeave={(e) => { if (!annCreating) e.currentTarget.style.background = "#d97706"; }}
            >
              {annCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
              Buat
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-600">Daftar Pengumuman</span>
          <span className="text-xs text-neutral-400">{total}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            Memuat...
          </div>
        ) : (
          <div className="rounded-lg border border-neutral-200 overflow-hidden" style={{ background: "#fff" }}>
            {announcements.map((a, i) => (
              <div
                key={a._id}
                className="flex items-start justify-between px-4 py-3.5"
                style={{ borderBottom: i < announcements.length - 1 ? "1px solid #f3f4f6" : "none" }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-neutral-800 truncate">{a.title}</p>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{
                        color: a.is_active ? "#059669" : "#9ca3af",
                        background: a.is_active ? "rgba(16,185,129,0.1)" : "#f3f4f6",
                      }}
                    >
                      {a.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500 mt-1.5 line-clamp-2">{a.body}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-400">
                    <span>{fmtDate(a.created_at)}</span>
                    <span>Ditutup {a.dismissed_count} user</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-3">
                  <button
                    onClick={() => handleToggle(a._id, a.is_active)}
                    disabled={togglingId === a._id}
                    className="p-1.5 rounded text-neutral-400 hover:bg-neutral-50 transition-colors disabled:opacity-50"
                    title={a.is_active ? "Nonaktifkan" : "Aktifkan"}
                  >
                    {togglingId === a._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : a.is_active ? (
                      <ToggleRight className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(a._id)}
                    disabled={deletingId === a._id}
                    className="p-1.5 rounded text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                    title="Hapus"
                  >
                    {deletingId === a._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
            {announcements.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-neutral-400">
                Belum ada pengumuman
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

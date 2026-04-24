"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, Plus, Lightbulb, Loader2, AlertCircle, Trash2, ChevronDown } from "lucide-react";
import { api } from "@/lib/api";

interface Strategy {
  _id: string;
  learning_strat_name: string;
  description: string;
  tips?: string[];
  created_at: string;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminStrategiesPage() {
  const [search, setSearch] = useState("");
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTips, setNewTips] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchStrategies();
  }, []);

  async function fetchStrategies() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Strategy[]>("/learningstrats");
      setStrategies(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal memuat strategies";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    try {
      const parsedTips = newTips
        .split("\n")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await api.post("/learningstrats", {
        learning_strat_name: name,
        description: newDesc.trim() || undefined,
        tips: parsedTips.length > 0 ? parsedTips : undefined,
      });
      setNewName("");
      setNewDesc("");
      setNewTips("");
      // Re-fetch to get accurate data from BE
      await fetchStrategies();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menambah strategi";
      setError(message);
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await api.delete(`/learningstrats/${id}`);
      setStrategies((prev) => prev.filter((s) => s._id !== id));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menghapus strategi";
      setError(message);
    } finally {
      setDeleting(null);
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return strategies;
    return strategies.filter(
      (s) =>
        s.learning_strat_name.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
    );
  }, [strategies, search]);

  return (
    <div className="mx-auto" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-neutral-800">Learning Strategies</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Kelola daftar strategi belajar</p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto underline text-red-700 hover:text-red-800 text-xs">
            Tutup
          </button>
        </div>
      )}

      {/* Add form */}
      <div
        className="rounded-lg border border-neutral-200 p-4"
        style={{ background: "#fff" }}
      >
        <form onSubmit={handleAdd}>
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1" style={{ minWidth: 0 }}>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Strategy Name</label>
              <input
                type="text"
                placeholder="Nama strategi..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                disabled={adding}
                className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-sm outline-none disabled:opacity-50"
                style={{ background: "#f9fafb" }}
              />
            </div>
            <div className="flex-1" style={{ minWidth: 0 }}>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Description <span className="text-neutral-400 font-normal">(opsional)</span></label>
              <input
                type="text"
                placeholder="Deskripsi singkat..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                disabled={adding}
                className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-sm outline-none disabled:opacity-50"
                style={{ background: "#f9fafb" }}
              />
            </div>
            <button
              type="submit"
              disabled={adding}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium text-white shrink-0 disabled:opacity-50"
              style={{ background: "#3B82F6" }}
              onMouseEnter={(e) => { if (!adding) e.currentTarget.style.background = "#2563eb"; }}
              onMouseLeave={(e) => { if (!adding) e.currentTarget.style.background = "#3B82F6"; }}
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Tambah
            </button>
          </div>
          <div style={{ marginTop: "12px" }}>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Tips <span className="text-neutral-400 font-normal">(opsional, satu per baris)</span></label>
            <textarea
              placeholder="Masukkan tips, satu per baris..."
              value={newTips}
              onChange={(e) => setNewTips(e.target.value)}
              disabled={adding}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-sm outline-none resize-y disabled:opacity-50"
              style={{ background: "#f9fafb", minHeight: "72px" }}
            />
          </div>
        </form>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Cari nama strategi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm outline-none"
          style={{ paddingLeft: "36px" }}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          Memuat strategies...
        </div>
      )}

      {/* Strategy list */}
      {!loading && (
        <div
          className="rounded-lg border border-neutral-200 overflow-hidden"
          style={{ background: "#fff" }}
        >
          {filtered.map((strategy, i) => (
            <div
              key={strategy._id}
              className="flex items-start justify-between px-4 py-3.5"
              style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none" }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded flex items-center justify-center shrink-0"
                    style={{ background: "rgba(245,158,11,0.1)" }}
                  >
                    <Lightbulb className="w-3.5 h-3.5" style={{ color: "#d97706" }} />
                  </div>
                  <p className="text-sm font-medium text-neutral-800">{strategy.learning_strat_name}</p>
                </div>
                {strategy.description && (
                  <p className="text-sm text-neutral-500 mt-1.5" style={{ marginLeft: "36px" }}>
                    {strategy.description}
                  </p>
                )}
                {strategy.tips && strategy.tips.length > 0 && (
                  <div style={{ marginLeft: "36px", marginTop: "6px" }}>
                    <button
                      onClick={() => setExpandedId(expandedId === strategy._id ? null : strategy._id)}
                      className="inline-flex items-center gap-1"
                      style={{
                        fontSize: "11px",
                        fontWeight: 500,
                        color: "#7c3aed",
                        background: "rgba(124,58,237,0.08)",
                        padding: "2px 8px",
                        borderRadius: "9999px",
                        lineHeight: "18px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <Lightbulb style={{ width: "12px", height: "12px" }} />
                      {strategy.tips.length} tips
                      <ChevronDown
                        style={{
                          width: "12px",
                          height: "12px",
                          transition: "transform 0.15s",
                          transform: expandedId === strategy._id ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      />
                    </button>
                    {expandedId === strategy._id && (
                      <div
                        style={{
                          marginTop: "8px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        {strategy.tips.map((tip, ti) => (
                          <div
                            key={ti}
                            className="flex items-start gap-2"
                            style={{
                              fontSize: "12px",
                              color: "#6b7280",
                              lineHeight: "18px",
                            }}
                          >
                            <span
                              style={{
                                width: "18px",
                                height: "18px",
                                borderRadius: "50%",
                                background: "rgba(124,58,237,0.1)",
                                color: "#7c3aed",
                                fontSize: "10px",
                                fontWeight: 600,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {ti + 1}
                            </span>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between shrink-0 ml-3 sm:flex-col sm:items-end sm:gap-1">
                <span className="text-sm text-neutral-400">{fmtDate(strategy.created_at)}</span>
                <button
                  onClick={() => handleDelete(strategy._id)}
                  disabled={deleting === strategy._id}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors disabled:opacity-50"
                  title="Hapus strategi"
                >
                  {deleting === strategy._id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-neutral-400">
              Tidak ada strategi ditemukan
            </div>
          )}
        </div>
      )}

      <p className="text-sm text-neutral-400 text-center">
        {filtered.length} strategi
      </p>
    </div>
  );
}

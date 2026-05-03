"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Scroll,
  Plus,
  Loader2,
  AlertCircle,
  Trash2,
  ChevronDown,
  Pencil,
  X,
  Check,
} from "lucide-react";
import { api } from "@/lib/api";

type QuestType = "deep_study" | "reflection_done" | "checklist_use";
type RewardType = "freeze" | "quest_item";

interface QuestTemplate {
  _id: string;
  description: string;
  type: QuestType;
  config: {
    target_count: number;
    min_duration_min: number;
  };
  reward: {
    type: RewardType;
    value: number;
    item_slot?: string;
    item_level?: number;
  };
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const QUEST_TYPES: { value: QuestType; label: string }[] = [
  { value: "deep_study", label: "Deep Study" },
  { value: "reflection_done", label: "Reflection" },
  { value: "checklist_use", label: "Checklist" },
];

const REWARD_TYPES: { value: RewardType; label: string }[] = [
  { value: "freeze", label: "Streak Freeze" },
  { value: "quest_item", label: "Quest Item" },
];

function fmtDate(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function toDateInput(iso: string) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

function statusBadge(status: string) {
  const map: Record<string, { bg: string; text: string }> = {
    active: { bg: "rgba(34,197,94,0.1)", text: "#16a34a" },
    expired: { bg: "rgba(156,163,175,0.1)", text: "#6b7280" },
    draft: { bg: "rgba(234,179,8,0.1)", text: "#ca8a04" },
  };
  const s = map[status] || map.draft;
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 600,
        background: s.bg,
        color: s.text,
        padding: "2px 8px",
        borderRadius: "9999px",
      }}
    >
      {status}
    </span>
  );
}

const emptyForm = {
  type: "deep_study" as QuestType,
  description: "",
  target_count: 3,
  min_duration_min: 25,
  reward_type: "freeze" as RewardType,
  reward_value: 1,
  start_date: "",
  end_date: "",
};

export default function AdminQuestsPage() {
  const [quests, setQuests] = useState<QuestTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<QuestTemplate>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchQuests();
  }, []);

  async function fetchQuests() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<QuestTemplate[]>("/api/admin/quests");
      setQuests(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memuat quests";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.start_date || !form.end_date || !form.description.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        type: form.type,
        description: form.description,
        start_date: form.start_date,
        end_date: form.end_date,
        target_count: form.target_count,
        config: {
          target_count: form.target_count,
          min_duration_min: form.min_duration_min,
        },
        reward: {
          type: form.reward_type,
          value: form.reward_value,
          item_slot: form.reward_type === "quest_item" ? "special" : undefined,
        },
      };
      await api.post("/api/admin/quests", payload);
      setForm(emptyForm);
      await fetchQuests();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membuat quest";
      setError(msg);
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    setError(null);
    try {
      await api.delete(`/api/admin/quests/${id}`);
      setQuests((prev) => prev.filter((q) => q._id !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus quest";
      setError(msg);
    } finally {
      setDeleting(null);
    }
  }

  function startEdit(q: QuestTemplate) {
    setEditId(q._id);
    setEditForm({
      description: q.description,
      type: q.type,
      start_date: toDateInput(q.start_date),
      end_date: toDateInput(q.end_date),
      config: { ...q.config },
      reward: { ...q.reward },
    });
  }

  function cancelEdit() {
    setEditId(null);
    setEditForm({});
  }

  async function saveEdit(id: string) {
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {};
      if (editForm.description !== undefined) payload.description = editForm.description;
      if (editForm.type !== undefined) payload.type = editForm.type;
      if (editForm.start_date !== undefined) payload.start_date = editForm.start_date;
      if (editForm.end_date !== undefined) payload.end_date = editForm.end_date;
      if (editForm.config) payload.config = editForm.config;
      if (editForm.reward) payload.reward = editForm.reward;

      await api.put(`/api/admin/quests/${id}`, payload);
      setEditId(null);
      setEditForm({});
      await fetchQuests();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal update quest";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return quests;
    return quests.filter(
      (t) =>
        t.type.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q)
    );
  }, [quests, search]);

  const inputCls =
    "w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-sm outline-none disabled:opacity-50";
  const inputBg = { background: "#f9fafb" };

  return (
    <div
      className="mx-auto"
      style={{ display: "flex", flexDirection: "column", gap: "20px" }}
    >
      <div>
        <h1 className="text-lg font-semibold text-neutral-800">
          Quest Templates
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Kelola quest periodik untuk mahasiswa
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-xs underline hover:no-underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Create form */}
      <div
        className="rounded-lg border border-neutral-200 p-4"
        style={{ background: "#fff" }}
      >
        <form onSubmit={handleAdd}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
            }}
          >
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Tipe Quest
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as QuestType })
                }
                disabled={adding}
                className={inputCls}
                style={inputBg}
              >
                {QUEST_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Target Count
              </label>
              <input
                type="number"
                min={1}
                value={form.target_count}
                onChange={(e) =>
                  setForm({ ...form, target_count: Number(e.target.value) })
                }
                disabled={adding}
                className={inputCls}
                style={inputBg}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Min Duration (menit)
              </label>
              <input
                type="number"
                min={1}
                value={form.min_duration_min}
                onChange={(e) =>
                  setForm({
                    ...form,
                    min_duration_min: Number(e.target.value),
                  })
                }
                disabled={adding}
                className={inputCls}
                style={inputBg}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Reward
              </label>
              <select
                value={form.reward_type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    reward_type: e.target.value as RewardType,
                  })
                }
                disabled={adding}
                className={inputCls}
                style={inputBg}
              >
                {REWARD_TYPES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Mulai
              </label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) =>
                  setForm({ ...form, start_date: e.target.value })
                }
                disabled={adding}
                className={inputCls}
                style={inputBg}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Selesai
              </label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) =>
                  setForm({ ...form, end_date: e.target.value })
                }
                disabled={adding}
                className={inputCls}
                style={inputBg}
              />
            </div>
          </div>
          <div style={{ marginTop: "12px" }}>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Deskripsi{" "}
              <span className="text-red-400 font-normal">*</span>
            </label>
            <input
              type="text"
              placeholder="Deskripsi quest..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              disabled={adding}
              className={inputCls}
              style={inputBg}
            />
          </div>
          <div
            style={{
              marginTop: "12px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="submit"
              disabled={adding || !form.start_date || !form.end_date}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium text-white shrink-0 disabled:opacity-50"
              style={{ background: "#3B82F6" }}
              onMouseEnter={(e) => {
                if (!adding) e.currentTarget.style.background = "#2563eb";
              }}
              onMouseLeave={(e) => {
                if (!adding) e.currentTarget.style.background = "#3B82F6";
              }}
            >
              {adding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Buat Quest
            </button>
          </div>
        </form>
      </div>

      {/* Search */}
      <div className="relative">
        <Scroll className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Cari tipe, deskripsi, status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm outline-none"
          style={{ paddingLeft: "36px" }}
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          Memuat quests...
        </div>
      )}

      {/* Quest list */}
      {!loading && (
        <div
          className="rounded-lg border border-neutral-200 overflow-hidden"
          style={{ background: "#fff" }}
        >
          {filtered.map((quest, i) => (
            <div
              key={quest._id}
              className="px-4 py-3.5"
              style={{
                borderBottom:
                  i < filtered.length - 1 ? "1px solid #f3f4f6" : "none",
              }}
            >
              {editId === quest._id ? (
                /* Inline edit */
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(160px, 1fr))",
                      gap: "10px",
                    }}
                  >
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Tipe
                      </label>
                      <select
                        value={editForm.type || quest.type}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            type: e.target.value as QuestType,
                          })
                        }
                        className={inputCls}
                        style={inputBg}
                      >
                        {QUEST_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Target
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={
                          editForm.config?.target_count ??
                          quest.config.target_count
                        }
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            config: {
                              ...(editForm.config || quest.config),
                              target_count: Number(e.target.value),
                            },
                          })
                        }
                        className={inputCls}
                        style={inputBg}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Mulai
                      </label>
                      <input
                        type="date"
                        value={
                          editForm.start_date || toDateInput(quest.start_date)
                        }
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            start_date: e.target.value,
                          })
                        }
                        className={inputCls}
                        style={inputBg}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Selesai
                      </label>
                      <input
                        type="date"
                        value={
                          editForm.end_date || toDateInput(quest.end_date)
                        }
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            end_date: e.target.value,
                          })
                        }
                        className={inputCls}
                        style={inputBg}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      Deskripsi
                    </label>
                    <input
                      type="text"
                      value={editForm.description ?? quest.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      className={inputCls}
                      style={inputBg}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      onClick={cancelEdit}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs text-neutral-600 hover:bg-neutral-100"
                    >
                      <X className="w-3.5 h-3.5" />
                      Batal
                    </button>
                    <button
                      onClick={() => saveEdit(quest._id)}
                      disabled={saving}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs text-white disabled:opacity-50"
                      style={{ background: "#3B82F6" }}
                    >
                      {saving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      Simpan
                    </button>
                  </div>
                </div>
              ) : (
                /* Display row */
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div
                        className="w-7 h-7 rounded flex items-center justify-center shrink-0"
                        style={{ background: "rgba(99,102,241,0.1)" }}
                      >
                        <Scroll
                          className="w-3.5 h-3.5"
                          style={{ color: "#6366f1" }}
                        />
                      </div>
                      <p className="text-sm font-medium text-neutral-800">
                        {QUEST_TYPES.find((t) => t.value === quest.type)
                          ?.label || quest.type}
                      </p>
                      {statusBadge(quest.status)}
                      <span className="text-xs text-neutral-400">
                        ×{quest.config.target_count}
                      </span>
                      {quest.type === "deep_study" && (
                        <span className="text-xs text-neutral-400">
                          · min {quest.config.min_duration_min} menit
                        </span>
                      )}
                    </div>
                    {quest.description && (
                      <p
                        className="text-sm text-neutral-500 mt-1"
                        style={{ marginLeft: "36px" }}
                      >
                        {quest.description}
                      </p>
                    )}
                    <div
                      className="flex items-center gap-3 mt-1.5"
                      style={{ marginLeft: "36px" }}
                    >
                      <span className="text-xs text-neutral-400">
                        {fmtDate(quest.start_date)} — {fmtDate(quest.end_date)}
                      </span>
                      <span className="text-xs text-neutral-300">|</span>
                      <span className="text-xs text-neutral-400">
                        Reward:{" "}
                        {REWARD_TYPES.find(
                          (r) => r.value === quest.reward.type
                        )?.label || quest.reward.type}
                        {quest.reward.type === "quest_item" &&
                          ` ×${quest.reward.value}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-3">
                    <button
                      onClick={() => startEdit(quest)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs text-neutral-500 hover:bg-neutral-100 transition-colors"
                      title="Edit quest"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(quest._id)}
                      disabled={deleting === quest._id}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors disabled:opacity-50"
                      title="Hapus quest"
                    >
                      {deleting === quest._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-neutral-400">
              Tidak ada quest ditemukan
            </div>
          )}
        </div>
      )}

      <p className="text-sm text-neutral-400 text-center">
        {filtered.length} quest template
      </p>
    </div>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, Plus, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { api } from "@/lib/api";

interface Course {
  _id: string;
  course_code: string;
  course_name: string;
  created_at: string;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminCoursesPage() {
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Course[]>("/courses");
      setCourses(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal memuat courses";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const code = newCode.trim();
    const name = newName.trim();
    if (!code || !name) return;
    setAdding(true);
    try {
      await api.post("/courses", {
        course_code: code.toUpperCase(),
        course_name: name,
      });
      // Re-fetch to get accurate data from BE
      await fetchCourses();
      setNewCode("");
      setNewName("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menambah course";
      setError(message);
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(code: string) {
    setDeleting(code);
    try {
      await api.delete(`/courses/${encodeURIComponent(code)}`);
      setCourses((prev) => prev.filter((c) => c.course_code !== code));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menghapus course";
      setError(message);
    } finally {
      setDeleting(null);
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (c) => c.course_code.toLowerCase().includes(q) || c.course_name.toLowerCase().includes(q)
    );
  }, [courses, search]);

  return (
    <div className="mx-auto" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-neutral-800">Courses</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Kelola daftar mata kuliah</p>
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
          <div className="flex items-end gap-3">
            <div className="flex-1" style={{ minWidth: 0 }}>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Course Code</label>
              <input
                type="text"
                placeholder="CS101"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                disabled={adding}
                className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-sm outline-none disabled:opacity-50"
                style={{ background: "#f9fafb" }}
              />
            </div>
            <div style={{ flex: 2, minWidth: 0 }}>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Course Name</label>
              <input
                type="text"
                placeholder="Nama mata kuliah..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                disabled={adding}
                className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-sm outline-none disabled:opacity-50"
                style={{ background: "#f9fafb" }}
              />
            </div>
            <button
              type="submit"
              disabled={adding}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium text-white shrink-0 disabled:opacity-50"
              style={{ background: "#3B82F6" }}
              onMouseEnter={(e) => { if (!adding) e.currentTarget.style.background = "#2563eb"; }}
              onMouseLeave={(e) => { if (!adding) e.currentTarget.style.background = "#3B82F6"; }}
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Tambah
            </button>
          </div>
        </form>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Cari kode atau nama..."
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
          Memuat courses...
        </div>
      )}

      {/* Course list */}
      {!loading && (
        <div
          className="rounded-lg border border-neutral-200 overflow-hidden"
          style={{ background: "#fff" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Code</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Course Name</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Dibuat</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((course) => (
                  <tr key={course._id || course.course_code} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td className="px-4 py-3">
                      <span
                        className="text-sm font-semibold px-2 py-0.5 rounded"
                        style={{ background: "rgba(59,130,246,0.08)", color: "#2563eb" }}
                      >
                        {course.course_code}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-800">{course.course_name}</td>
                    <td className="px-4 py-3 text-sm text-neutral-400">{fmtDate(course.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(course.course_code)}
                        disabled={deleting === course.course_code}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Hapus course"
                      >
                        {deleting === course.course_code ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-neutral-400">
                      Tidak ada course ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-sm text-neutral-400 text-center">
        {filtered.length} course{filtered.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MessageCircleWarning,
  Bug,
  HelpCircle,
  Lightbulb,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  Loader2,
  Search,
  Send,
  X,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminReportStore, type Report } from "@/stores/report";
import { toast } from "sonner";

const REPORT_TYPES = [
  { value: "bug", label: "Bug / Error", icon: Bug, color: "text-rose-500", bg: "bg-rose-50" },
  { value: "pertanyaan", label: "Pertanyaan", icon: HelpCircle, color: "text-blue-500", bg: "bg-blue-50" },
  { value: "saran", label: "Saran", icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-50" },
  { value: "lainnya", label: "Lainnya", icon: MoreHorizontal, color: "text-neutral-500", bg: "bg-neutral-100" },
];

function typeConfig(type: string) {
  return REPORT_TYPES.find((t) => t.value === type) ?? REPORT_TYPES[3];
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminReportsPage() {
  const { reports, total, page, loading, responding, fetchReports, respondToReport } =
    useAdminReportStore();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    fetchReports(1, statusFilter || undefined);
  }, [fetchReports, statusFilter]);

  const handleRespond = async (reportId: string) => {
    if (!responseText.trim()) return;
    const ok = await respondToReport(reportId, responseText.trim());
    if (ok) {
      toast.success("Respons terkirim");
      setRespondingId(null);
      setResponseText("");
    } else {
      toast.error("Gagal mengirim respons");
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="mx-auto" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 className="text-lg font-semibold text-neutral-800">Laporan User</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Kelola laporan masalah dan pertanyaan dari user</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex gap-2">
          {[
            { value: "", label: "Semua" },
            { value: "open", label: "Menunggu" },
            { value: "resolved", label: "Direspon" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                statusFilter === f.value
                  ? "bg-primary text-white"
                  : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-neutral-400 ml-auto">{total} laporan</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          Memuat...
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center mb-3">
            <MessageCircleWarning className="w-6 h-6 text-neutral-300" />
          </div>
          <p className="text-sm text-neutral-400">Belum ada laporan</p>
        </div>
      ) : (
        <div className="rounded-lg border border-neutral-200 overflow-hidden" style={{ background: "#fff" }}>
          {reports.map((report, i) => {
            const tc = typeConfig(report.type);
            const TypeIcon = tc.icon;
            const isResolved = report.status === "resolved";
            const isResponding = respondingId === report._id;

            return (
              <div
                key={report._id}
                style={{ borderBottom: i < reports.length - 1 ? "1px solid #f3f4f6" : "none" }}
                className="px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={cn("w-6 h-6 rounded flex items-center justify-center shrink-0", tc.bg)}>
                        <TypeIcon className={cn("w-3 h-3", tc.color)} />
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                        {tc.label}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded",
                          isResolved
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                        )}
                      >
                        {isResolved ? "Direspon" : "Menunggu"}
                      </span>
                      <span className="text-[10px] text-neutral-300 ml-auto shrink-0">{fmtDate(report.created_at)}</span>
                    </div>
                    <p className="text-sm font-medium text-neutral-800">{report.title}</p>
                    <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{report.description}</p>
                  </div>
                </div>

                {isResolved && report.admin_response && (
                  <div className="mt-3 pl-0 border-l-2 border-emerald-200 bg-emerald-50/50 rounded-r-lg px-3 py-2.5">
                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Respons Admin</p>
                    <p className="text-sm text-neutral-700">{report.admin_response}</p>
                  </div>
                )}

                {!isResolved && (
                  <div className="mt-3">
                    {isResponding ? (
                      <div className="space-y-2.5">
                        <textarea
                          rows={2}
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Tulis respons..."
                          className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
                          style={{ background: "#f9fafb" }}
                        />
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => {
                              setRespondingId(null);
                              setResponseText("");
                            }}
                            className="px-3 py-2 rounded-lg text-xs font-medium text-neutral-500 border border-neutral-200 hover:bg-neutral-50 transition-colors"
                          >
                            Batal
                          </button>
                          <button
                            onClick={() => handleRespond(report._id)}
                            disabled={responding === report._id || !responseText.trim()}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white disabled:opacity-50"
                            style={{ background: "#3B82F6" }}
                          >
                            {responding === report._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            Kirim
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRespondingId(report._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Respon
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => fetchReports(page - 1, statusFilter || undefined)}
            disabled={page <= 1}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
          >
            Sebelumnya
          </button>
          <span className="text-sm text-neutral-400">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => fetchReports(page + 1, statusFilter || undefined)}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
          >
            Selanjutnya
          </button>
        </div>
      )}
    </div>
  );
}

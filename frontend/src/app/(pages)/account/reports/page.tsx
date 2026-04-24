"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircleWarning,
  Plus,
  Loader2,
  Bug,
  HelpCircle,
  Lightbulb,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  ChevronRight,
  X,
} from "lucide-react";
import { SettingsHeader } from "@/components/feature/settings/SettingsHeader";
import { cn } from "@/lib/utils";
import { useReportStore, type Report } from "@/stores/report";
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

export default function ReportsPage() {
  const { myReports, loading, submitting, fetchMyReports, submitReport } =
    useReportStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchMyReports();
  }, [fetchMyReports]);

  const handleSubmit = async (data: {
    type: string;
    title: string;
    description: string;
  }) => {
    const ok = await submitReport(data);
    if (ok) {
      toast.success("Laporan terkirim");
      setShowForm(false);
      fetchMyReports();
    } else {
      toast.error("Gagal mengirim laporan");
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-neutral-50">
      <SettingsHeader title="Laporkan Masalah" />

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pt-6 pb-28 space-y-5">
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-white font-bold text-sm active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          Buat Laporan Baru
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-neutral-400 animate-spin" />
          </div>
        ) : myReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
              <MessageCircleWarning className="w-7 h-7 text-neutral-300" />
            </div>
            <p className="text-sm text-neutral-400 font-medium">
              Belum ada laporan
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {myReports.map((report) => (
              <ReportCard key={report._id} report={report} />
            ))}
          </div>
        )}
      </main>

      <AnimatePresence>
        {showForm && (
          <ReportFormModal
            submitting={submitting}
            onClose={() => setShowForm(false)}
            onSubmit={handleSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ReportCard({ report }: { report: Report }) {
  const tc = typeConfig(report.type);
  const TypeIcon = tc.icon;
  const isResolved = report.status === "resolved";

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border overflow-hidden shadow-sm",
        isResolved ? "border-emerald-100" : "border-neutral-200"
      )}
    >
      <div className="px-4 py-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                tc.bg
              )}
            >
              <TypeIcon className={cn("w-4 h-4", tc.color)} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-neutral-900 truncate">
                {report.title}
              </p>
              <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
                {fmtDate(report.created_at)}
              </p>
            </div>
          </div>
          <span
            className={cn(
              "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shrink-0",
              isResolved
                ? "bg-emerald-50 text-emerald-600"
                : "bg-amber-50 text-amber-600"
            )}
          >
            {isResolved ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Direspon
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Menunggu
              </span>
            )}
          </span>
        </div>
        <p className="text-sm text-neutral-600 font-medium leading-relaxed mt-3">
          {report.description}
        </p>
      </div>

      {isResolved && report.admin_response && (
        <div className="border-t border-emerald-50 bg-emerald-50/50 px-4 py-3.5">
          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1.5">
            Respons Admin
          </p>
          <p className="text-sm text-neutral-700 font-medium leading-relaxed">
            {report.admin_response}
          </p>
          {report.responded_at && (
            <p className="text-[10px] text-neutral-400 font-medium mt-2">
              {fmtDate(report.responded_at)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ReportFormModal({
  submitting,
  onClose,
  onSubmit,
}: {
  submitting: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: string;
    title: string;
    description: string;
  }) => void;
}) {
  const [type, setType] = useState("bug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const canSubmit = title.trim() && description.trim() && !submitting;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-x-4 top-[10%] bottom-auto max-w-md mx-auto bg-white rounded-3xl z-50 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h2 className="text-base font-bold text-neutral-900">
            Laporan Baru
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-5 max-h-[70vh] overflow-y-auto no-scrollbar">
          <div className="space-y-2.5">
            <label className="text-sm font-bold text-neutral-900">
              Tipe Laporan
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {REPORT_TYPES.map((t) => {
                const Icon = t.icon;
                const selected = type === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={cn(
                      "flex items-center gap-2.5 px-3.5 py-3 rounded-xl border transition-all",
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-neutral-200 bg-white"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0",
                        selected ? "text-primary" : t.color
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        selected
                          ? "text-primary font-bold"
                          : "text-neutral-600"
                      )}
                    >
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-900">
              Judul <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ringkasan singkat masalah"
              className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-white text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-900">
              Deskripsi <span className="text-error">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan detail masalah, langkah reproduksi, atau pertanyaanmu..."
              className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-white text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none shadow-sm leading-relaxed"
            />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-neutral-100">
          <button
            onClick={() =>
              canSubmit &&
              onSubmit({
                type,
                title: title.trim(),
                description: description.trim(),
              })
            }
            disabled={!canSubmit}
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-sm active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Mengirim...
              </span>
            ) : (
              "Kirim Laporan"
            )}
          </button>
        </div>
      </motion.div>
    </>
  );
}

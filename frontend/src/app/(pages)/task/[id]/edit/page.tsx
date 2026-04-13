"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Target,
  AlignLeft,
  Lightbulb,
  Calendar as CalendarIcon,
  Clock,
  ArrowLeft,
  Trash2,
  Archive,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Drawer } from "@/components/ui/Drawer";
import { Calendar } from "@/components/ui/Calendar";
import { TimePicker } from "@/components/ui/TimePicker";
import { CourseSelector } from "@/components/feature/task/CourseSelector";
import { StrategySelector } from "@/components/feature/task/StrategySelector";
import { PrioritySelector, PriorityLevel } from "@/components/feature/task/PrioritySelector";
import { AdvancedOptions, AdvancedOptionsData } from "@/components/feature/task/AdvancedOptions";
import { TaskStatusStepper, TaskStatus } from "@/components/feature/task/TaskStatusStepper";
import { cn } from "@/lib/utils";
import { useBoardStore } from "@/stores/board";
import type { ColumnKey } from "@/types";

// Map FE column key to TaskStatus label
const COLUMN_TO_STATUS: Record<ColumnKey, TaskStatus> = {
  planning: "Planning",
  monitoring: "Monitoring",
  controlling: "Controlling",
  reflection: "Reflection",
};

// Map BE difficulty ("Hard" | "Medium" | "Easy") to FE PriorityLevel ("Low" | "Medium" | "High")
function difficultyToPriority(d: "Hard" | "Medium" | "Easy"): PriorityLevel {
  if (d === "Hard") return "High";
  if (d === "Easy") return "Low";
  return "Medium";
}

// Map FE PriorityLevel back to BE difficulty
function priorityToDifficulty(p: PriorityLevel): "Hard" | "Medium" | "Easy" {
  if (p === "High") return "Hard";
  if (p === "Low") return "Easy";
  return "Medium";
}

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  // Store
  const tasks = useBoardStore((s) => s.tasks);
  const columns = useBoardStore((s) => s.columns);
  const loading = useBoardStore((s) => s.loading);
  const fetchBoard = useBoardStore((s) => s.fetchBoard);
  const updateCard = useBoardStore((s) => s.updateCard);
  const deleteCard = useBoardStore((s) => s.deleteCard);

  // Derived task data
  const card = tasks[id] ?? null;

  // Derive status from which column the card is in
  const cardStatus = useMemo<TaskStatus>(() => {
    for (const [colKey, cardIds] of Object.entries(columns)) {
      if (cardIds.includes(id)) {
        return COLUMN_TO_STATUS[colKey as ColumnKey] ?? "Planning";
      }
    }
    return "Planning";
  }, [columns, id]);

  // Form State — initialized once card is available
  const [status, setStatus] = useState<TaskStatus>(cardStatus);
  const [course, setCourse] = useState(card?.course_name ?? "");
  const [taskName, setTaskName] = useState(card?.task_name ?? "");
  const [description, setDescription] = useState(card?.description ?? "");
  const [strategy, setStrategy] = useState(card?.learning_strategy ?? "");
  const [goal, setGoal] = useState(card?.goal_check?.goal_text ?? "");
  const [priority, setPriority] = useState<PriorityLevel>(
    card?.difficulty ? difficultyToPriority(card.difficulty) : "Medium"
  );
  const [dueDate, setDueDate] = useState<Date | null>(
    card?.deadline ? new Date(card.deadline) : null
  );
  const [dueTime, setDueTime] = useState(
    card?.deadline
      ? `${new Date(card.deadline).getHours().toString().padStart(2, "0")}:${new Date(card.deadline).getMinutes().toString().padStart(2, "0")}`
      : ""
  );
  const [saving, setSaving] = useState(false);
  const [showDeleteDrawer, setShowDeleteDrawer] = useState(false);
  const [showArchiveDrawer, setShowArchiveDrawer] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [advanced, setAdvanced] = useState<AdvancedOptionsData>({
    difficulty: card?.difficulty ? (card.difficulty as "Easy" | "Medium" | "Hard") : "Medium",
    checklists: card?.checklists ?? [],
    links: (card?.links ?? []).map((l) => ({ ...l, id: l.id || "" })),
    preTestGrade: card?.pre_test_grade,
  });

  // Sync form when card loads
  useEffect(() => {
    if (!card) return;
    setCourse(card.course_name ?? "");
    setTaskName(card.task_name ?? "");
    setDescription(card.description ?? "");
    setPriority(card.difficulty ? difficultyToPriority(card.difficulty) : "Medium");
    if (card.deadline) {
      const d = new Date(card.deadline);
      setDueDate(d);
      setDueTime(`${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`);
    }
    setStrategy(card.learning_strategy ?? "");
    setGoal(card.goal_check?.goal_text ?? "");
  }, [card]);

  useEffect(() => {
    setStatus(cardStatus);
  }, [cardStatus]);

  // UI State
  const [isDateDrawerOpen, setIsDateDrawerOpen] = useState(false);
  const [isTimeDrawerOpen, setIsTimeDrawerOpen] = useState(false);

  // Fetch board if tasks are empty (e.g. deep-linked)
  useEffect(() => {
    if (Object.keys(tasks).length === 0) {
      fetchBoard();
    }
  }, [tasks, fetchBoard]);

  const handleSave = async () => {
    if (!card) return;
    setSaving(true);

    // Build deadline string from date + time
    let deadline: string | undefined;
    if (dueDate) {
      const [h = 0, m = 0] = (dueTime || "23:59").split(":").map(Number);
      const d = new Date(dueDate);
      d.setHours(h, m);
      deadline = d.toISOString();
    }

    try {
      await updateCard(id, {
        task_name: taskName,
        course_name: course,
        description: description || undefined,
        learning_strategy: strategy || undefined,
        priority: priority,
        difficulty: advanced.difficulty,
        deadline,
        goal_check: goal.trim()
          ? { goal_text: goal.trim(), ...(card.goal_check?.helpful !== undefined ? { helpful: card.goal_check.helpful } : {}) }
          : undefined,
        checklists: advanced.checklists.length > 0 ? advanced.checklists : undefined,
        links: advanced.links.length > 0 ? advanced.links : undefined,
        pre_test_grade: advanced.preTestGrade,
      });
    } finally {
      setSaving(false);
      router.back();
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCard(id);
      router.push("/board");
    } finally {
      setDeleting(false);
    }
  };

  const handleArchive = async () => {
    setDeleting(true);
    try {
      await updateCard(id, { archived: true });
      router.push("/board");
    } finally {
      setDeleting(false);
    }
  };

  const formatDateDisplay = (date: Date | null) => {
    if (!date) return "Pilih tgl";
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(date);
  };

  // Loading / not-found states
  if (loading && !card) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-neutral-50">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!loading && !card) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-neutral-50 gap-4 px-6">
        <p className="text-neutral-500 text-sm font-medium">Tugas tidak ditemukan</p>
        <button
          onClick={() => router.back()}
          className="text-sm font-bold text-primary"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col mx-auto bg-neutral-50 relative overflow-hidden max-w-md">

      {/* Header */}
      <header className="shrink-0 pt-14 pb-4 px-6 bg-white border-b border-neutral-100 flex items-center justify-between sticky top-0 z-40">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 -ml-2 flex items-center justify-center text-neutral-500 hover:text-neutral-900 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg md:text-xl font-bold text-neutral-900 tracking-tight">Edit Tugas</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-sm font-bold text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </header>

      {/* MATCHING NEW TASK STRUCTURE: main with px-5 */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pt-6 pb-28 relative">
        <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>

          {/* 1. Status Indicator (Needs -mx-5 to counteract main padding) */}
          <div className="-mx-5 -mt-6 mb-2">
            <TaskStatusStepper
              currentStatus={status}
              onUpdateStatus={() => console.log("Open status update drawer")}
            />
          </div>

          <CourseSelector
            value={course}
            onChange={setCourse}
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Target className="w-[18px] h-[18px] text-amber-500" /> Nama Tugas <span className="text-error">*</span>
            </label>
            <Input value={taskName} onChange={(e) => setTaskName(e.target.value)} placeholder="Apa yang mau dikerjakan?" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <AlignLeft className="w-[18px] h-[18px] text-neutral-400" /> Deskripsi
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-white text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none shadow-sm leading-relaxed min-h-[120px] max-h-[200px]"
            ></textarea>
          </div>

          <StrategySelector value={strategy} onChange={setStrategy} />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Lightbulb className="w-[18px] h-[18px] text-amber-500" /> Tujuan Tugas <span className="text-error">*</span>
            </label>
            <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Tulis tujuanmu..." />
          </div>

          <PrioritySelector value={priority} onChange={setPriority} />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <CalendarIcon className="w-[18px] h-[18px] text-teal-500" /> Deadline
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsDateDrawerOpen(true)}
                className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-neutral-200 bg-white active:bg-neutral-50 transition-colors shadow-sm"
              >
                <span className="text-sm font-bold text-neutral-800">{formatDateDisplay(dueDate)}</span>
                <CalendarIcon className="w-4.5 h-4.5 text-neutral-400" />
              </button>
              <button
                type="button"
                onClick={() => setIsTimeDrawerOpen(true)}
                className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-neutral-200 bg-white active:bg-neutral-50 transition-colors shadow-sm"
              >
                <span className="text-sm font-bold text-neutral-800">{dueTime || "Pilih jam"}</span>
                <Clock className="w-4.5 h-4.5 text-neutral-400" />
              </button>
            </div>
          </div>

          {/* Opsi Lanjutan - Now will work perfectly with -mx-5 */}
          <AdvancedOptions onChange={setAdvanced} defaultValue={advanced} />

          {/* Meta & Danger Zone */}
          <section className="flex flex-col items-center gap-8 pt-4 pb-10">
            <div className="text-center space-y-1.5">
              <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Dibuat: {card?.created_at ? new Date(card.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}</p>
              <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">ID: {id}</p>
            </div>

            <div className="w-full space-y-3.5">
              <button
                onClick={() => setShowDeleteDrawer(true)}
                className="w-full py-4 rounded-2xl border border-red-100 bg-red-50 text-red-600 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <Trash2 className="w-5 h-5" /> Hapus Tugas
              </button>
              <button
                onClick={() => setShowArchiveDrawer(true)}
                className="w-full py-4 rounded-2xl border border-neutral-200 bg-white text-neutral-700 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm"
              >
                <Archive className="w-5 h-5" /> Arsipkan Tugas
              </button>
            </div>
          </section>
        </form>
      </main>

      <Drawer isOpen={isDateDrawerOpen} onClose={() => setIsDateDrawerOpen(false)} title="Ubah Tanggal">
        <Calendar selectedDate={dueDate} onSelect={(date) => { setDueDate(date); setIsDateDrawerOpen(false); }} />
      </Drawer>

      <Drawer isOpen={isTimeDrawerOpen} onClose={() => setIsTimeDrawerOpen(false)} title="Ubah Jam">
        <TimePicker selectedTime={dueTime} onSelect={setDueTime} />
        <button onClick={() => setIsTimeDrawerOpen(false)} className="w-full mt-6 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform">
          Selesai
        </button>
      </Drawer>

      {/* Delete Confirmation Drawer */}
      <Drawer isOpen={showDeleteDrawer} onClose={() => setShowDeleteDrawer(false)} title="Hapus Tugas?">
        <div className="space-y-5 pt-2">
          <p className="text-sm text-neutral-600 font-medium leading-relaxed">
            Tugas <strong>"{card?.task_name}"</strong> akan dihapus secara permanen.
          </p>

          {/* Data loss warning card */}
          <div className="bg-red-50/80 border border-red-100 rounded-2xl p-4">
            <p className="text-xs text-red-700/80 font-medium leading-relaxed">
              Semua data terkait tugas ini akan ikut terhapus, termasuk sesi belajar, personal best, statistik belajar, data refleksi, dan catatan.
            </p>
          </div>

          {/* Archive suggestion */}
          <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4">
            <p className="text-xs text-neutral-500 font-medium leading-relaxed">
              <span className="font-bold text-neutral-700">Ingin menyimpan datanya?</span> Pilih <strong>Arsipkan</strong> sebagai pengganti hapus — semua data analitik tetap tersimpan.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteDrawer(false)}
              className="flex-1 py-4 bg-white border border-neutral-200 text-neutral-700 rounded-2xl font-bold text-sm active:scale-95 transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold text-sm active:scale-95 transition-all disabled:opacity-50"
            >
              {deleting ? "Menghapus..." : "Ya, Hapus"}
            </button>
          </div>
        </div>
      </Drawer>

      {/* Archive Confirmation Drawer */}
      <Drawer isOpen={showArchiveDrawer} onClose={() => setShowArchiveDrawer(false)} title="Arsipkan Tugas?">
        <div className="space-y-6 pt-2">
          <p className="text-sm text-neutral-600 font-medium leading-relaxed">
            Tugas <strong>"{card?.task_name}"</strong> akan dipindahkan ke arsip. Tugas tidak akan muncul di board lagi.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowArchiveDrawer(false)}
              className="flex-1 py-4 bg-white border border-neutral-200 text-neutral-700 rounded-2xl font-bold text-sm active:scale-95 transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleArchive}
              disabled={deleting}
              className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold text-sm active:scale-95 transition-all disabled:opacity-50"
            >
              {deleting ? "Mengarsipkan..." : "Ya, Arsipkan"}
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

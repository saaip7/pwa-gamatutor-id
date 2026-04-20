"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Target,
  AlignLeft,
  Lightbulb,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";
import { NewTaskHeader } from "@/components/feature/task/NewTaskHeader";
import { CourseSelector } from "@/components/feature/task/CourseSelector";
import { StrategySelector } from "@/components/feature/task/StrategySelector";
import { PrioritySelector, PriorityLevel } from "@/components/feature/task/PrioritySelector";
import {
  AdvancedOptions,
  AdvancedOptionsData,
} from "@/components/feature/task/AdvancedOptions";
import { Input } from "@/components/ui/Input";
import { Drawer } from "@/components/ui/Drawer";
import { Calendar } from "@/components/ui/Calendar";
import { TimePicker } from "@/components/ui/TimePicker";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useBoardStore } from "@/stores/board";

const DEFAULT_ADVANCED: AdvancedOptionsData = {
  difficulty: "Medium",
  checklists: [],
  links: [],
};

export default function NewTaskPage() {
  const router = useRouter();
  const createCard = useBoardStore((s) => s.createCard);

  // Form State
  const [course, setCourse] = useState("");
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [strategy, setStrategy] = useState("");
  const [goal, setGoal] = useState("");
  const [priority, setPriority] = useState<PriorityLevel>("Medium");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [dueTime, setDueTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [advanced, setAdvanced] = useState<AdvancedOptionsData>(DEFAULT_ADVANCED);

  // UI State for Drawers
  const [isDateDrawerOpen, setIsDateDrawerOpen] = useState(false);
  const [isTimeDrawerOpen, setIsTimeDrawerOpen] = useState(false);

  const isValid =
    !saving &&
    course.trim() !== "" &&
    taskName.trim() !== "" &&
    strategy !== "" &&
    goal.trim() !== "";

  const handleAdvancedChange = useCallback(
    (data: AdvancedOptionsData) => {
      setAdvanced(data);
    },
    []
  );

  const handleSave = async () => {
    setSaving(true);

    try {
      // Build deadline ISO string combining date + time
      let deadline: string | undefined;
      if (dueDate) {
        const d = new Date(dueDate.getTime() - dueDate.getTimezoneOffset() * 60000);
        if (dueTime) {
          const [h, m] = dueTime.split(":").map(Number);
          d.setUTCHours(h || 0, m || 0, 0, 0);
        }
        deadline = d.toISOString();
      }

      await createCard({
        task_name: taskName,
        course_name: course,
        description: description || undefined,
        learning_strategy: strategy || undefined,
        priority: priority || undefined,
        difficulty: advanced.difficulty || undefined,
        deadline,
        goal_check: goal.trim() ? { goal_text: goal.trim() } : undefined,
        checklists:
          advanced.checklists.length > 0 ? advanced.checklists : undefined,
        links: advanced.links.length > 0 ? advanced.links : undefined,
        pre_test_grade: advanced.preTestGrade,
      });

      toast.success("Langkah baru dimulai! Tugas siap dikerjakan.", { duration: 3000 });
      router.back();
    } catch {
      // Error handled in store
    } finally {
      setSaving(false);
    }
  };

  const formatDateDisplay = (date: Date | null) => {
    if (!date) return "Pilih tgl";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="w-full h-screen flex flex-col mx-auto bg-neutral-50 relative overflow-hidden max-w-md">
      <NewTaskHeader isValid={isValid} onSave={handleSave} />

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pt-6 pb-28 relative">
        <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
          {/* 1. Mata Kuliah */}
          <CourseSelector value={course} onChange={setCourse} />

          {/* 2. Nama Tugas */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="task_name"
              className="text-sm font-semibold text-neutral-900 flex items-center gap-2"
            >
              <Target className="w-[18px] h-[18px] text-amber-500" /> Nama
              Tugas <span className="text-error">*</span>
            </label>
            <Input
              id="task_name"
              placeholder="Apa yang mau dikerjakan?"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
            />
          </div>

          {/* 3. Deskripsi */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="description"
              className="text-sm font-semibold text-neutral-900 flex items-center gap-2"
            >
              <AlignLeft className="w-[18px] h-[18px] text-neutral-500" />{" "}
              Deskripsi
            </label>
            <textarea
              id="description"
              rows={5}
              placeholder="Deskripsi tambahan (opsional)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-white text-base placeholder:text-neutral-400 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none shadow-sm min-h-[120px] max-h-[200px]"
            ></textarea>
          </div>

          {/* 4. Strategi Belajar */}
          <StrategySelector value={strategy} onChange={setStrategy} />

          {/* 5. Tujuan Task */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="goal"
              className="text-sm font-semibold text-neutral-900 flex items-center gap-2"
            >
              <Lightbulb className="w-[18px] h-[18px] text-amber-500" /> Tujuan
              Tugas <span className="text-error">*</span>
            </label>

            <Input
              id="goal"
              placeholder="Tulis tujuanmu..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />

            <div className="mt-1 flex flex-wrap gap-2">
              {["Memahami konsep", "Persiapan UTS", "Latihan mandiri"].map(
                (g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGoal(g)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs font-medium text-neutral-600 shadow-sm active:bg-neutral-50 transition-colors"
                  >
                    {g}
                  </button>
                )
              )}
            </div>
          </div>

          {/* 6. Prioritas */}
          <PrioritySelector value={priority} onChange={setPriority} />

          {/* 7. Deadline */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <CalendarIcon className="w-[18px] h-[18px] text-teal-500" />{" "}
              Deadline Target
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsDateDrawerOpen(true)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl border shadow-sm transition-colors text-left",
                  dueDate
                    ? "border-primary bg-primary/5 border-2"
                    : "border-neutral-200 bg-white active:bg-neutral-50"
                )}
              >
                <CalendarIcon
                  className={cn(
                    "w-5 h-5",
                    dueDate ? "text-primary" : "text-neutral-400"
                  )}
                />
                <span
                  className={cn(
                    "text-sm font-medium truncate",
                    dueDate
                      ? "text-primary font-bold"
                      : "text-neutral-600"
                  )}
                >
                  {formatDateDisplay(dueDate)}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsTimeDrawerOpen(true)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl border shadow-sm transition-colors text-left",
                  dueTime
                    ? "border-primary bg-primary/5 border-2"
                    : "border-neutral-200 bg-white active:bg-neutral-50"
                )}
              >
                <Clock
                  className={cn(
                    "w-5 h-5",
                    dueTime ? "text-primary" : "text-neutral-400"
                  )}
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    dueTime
                      ? "text-primary font-bold"
                      : "text-neutral-600"
                  )}
                >
                  {dueTime || "Pilih jam"}
                </span>
              </button>
            </div>
          </div>

          {/* 8. Opsi Lanjutan */}
          <AdvancedOptions onChange={handleAdvancedChange} />
        </form>
      </main>

      {/* Date Picker Drawer */}
      <Drawer
        isOpen={isDateDrawerOpen}
        onClose={() => setIsDateDrawerOpen(false)}
        title="Pilih Tanggal"
      >
        <Calendar
          selectedDate={dueDate}
          onSelect={(date) => {
            setDueDate(date);
            setIsDateDrawerOpen(false);
          }}
        />
        <div className="mt-4 pt-4 border-t border-neutral-100 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setDueDate(new Date());
              setIsDateDrawerOpen(false);
            }}
            className="py-3.5 rounded-xl bg-neutral-100 text-neutral-600 text-sm font-bold active:bg-neutral-200"
          >
            Hari Ini
          </button>
          <button
            type="button"
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              setDueDate(tomorrow);
              setIsDateDrawerOpen(false);
            }}
            className="py-3.5 rounded-xl bg-neutral-100 text-neutral-600 text-sm font-bold active:bg-neutral-200"
          >
            Besok
          </button>
        </div>
      </Drawer>

      {/* Time Picker Drawer */}
      <Drawer
        isOpen={isTimeDrawerOpen}
        onClose={() => setIsTimeDrawerOpen(false)}
        title="Pilih Jam"
      >
        <TimePicker
          selectedTime={dueTime}
          onSelect={(time) => {
            setDueTime(time);
          }}
        />
        <button
          type="button"
          onClick={() => setIsTimeDrawerOpen(false)}
          className="w-full mt-6 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform"
        >
          Selesai
        </button>
      </Drawer>
    </div>
  );
}

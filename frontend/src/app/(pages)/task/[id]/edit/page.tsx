"use client";

import React, { useState } from "react";
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
  Archive
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Drawer } from "@/components/ui/Drawer";
import { Calendar } from "@/components/ui/Calendar";
import { TimePicker } from "@/components/ui/TimePicker";
import { CourseSelector } from "@/components/feature/task/CourseSelector";
import { StrategySelector, LearningStrategy } from "@/components/feature/task/StrategySelector";
import { PrioritySelector, PriorityLevel } from "@/components/feature/task/PrioritySelector";
import { AdvancedOptions } from "@/components/feature/task/AdvancedOptions";
import { TaskStatusStepper, TaskStatus } from "@/components/feature/task/TaskStatusStepper";
import { cn } from "@/lib/utils";

// Mock Data for Pre-filling
const MOCK_TASK_DATA = {
  id: "1",
  course: "Algoritma & Pemrograman",
  taskName: "Review materi sorting",
  description: "Pelajari bubble sort dan insertion sort untuk persiapan kuis minggu depan. Buat ringkasan kompleksitas waktu dan contoh code dalam Python.",
  strategy: "Practice Questions" as LearningStrategy,
  goal: "Persiapan kuis mingguan",
  priority: "High" as PriorityLevel,
  dueDate: new Date(2025, 1, 28),
  dueTime: "23:59",
  status: "Monitoring" as TaskStatus,
  createdAt: "24 Feb 2025, 14:30",
  updatedAt: "26 Feb 2025, 09:15"
};

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  
  // Form State
  const [status, setStatus] = useState<TaskStatus>(MOCK_TASK_DATA.status);
  const [course, setCourse] = useState(MOCK_TASK_DATA.course);
  const [taskName, setTaskName] = useState(MOCK_TASK_DATA.taskName);
  const [description, setDescription] = useState(MOCK_TASK_DATA.description);
  const [strategy, setStrategy] = useState<LearningStrategy | "">(MOCK_TASK_DATA.strategy);
  const [goal, setGoal] = useState(MOCK_TASK_DATA.goal);
  const [priority, setPriority] = useState<PriorityLevel>(MOCK_TASK_DATA.priority);
  const [dueDate, setDueDate] = useState<Date | null>(MOCK_TASK_DATA.dueDate);
  const [dueTime, setDueTime] = useState(MOCK_TASK_DATA.dueTime);

  // UI State
  const [isDateDrawerOpen, setIsDateDrawerOpen] = useState(false);
  const [isTimeDrawerOpen, setIsTimeDrawerOpen] = useState(false);

  const handleSave = () => {
    console.log("Updating Task:", { id: params.id, status });
    router.back();
  };

  const formatDateDisplay = (date: Date | null) => {
    if (!date) return "Pilih tgl";
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(date);
  };

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
        <h1 className="text-[16px] font-bold text-neutral-900 tracking-tight">Edit Tugas</h1>
        <button onClick={handleSave} className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">
          Simpan
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
            suggestions={["Algoritma & Pemrograman", "Basis Data", "Kalkulus"]} 
          />

          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-neutral-900 flex items-center gap-2">
              <Target className="w-[18px] h-[18px] text-amber-500" /> Nama Tugas <span className="text-error">*</span>
            </label>
            <Input value={taskName} onChange={(e) => setTaskName(e.target.value)} placeholder="Apa yang mau dikerjakan?" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-neutral-900 flex items-center gap-2">
              <AlignLeft className="w-[18px] h-[18px] text-neutral-400" /> Deskripsi
            </label>
            <textarea 
              rows={5} 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-white text-[14px] focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none shadow-sm leading-relaxed min-h-[120px] max-h-[200px]"
            ></textarea>
          </div>

          <StrategySelector value={strategy} onChange={setStrategy} />

          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-neutral-900 flex items-center gap-2">
              <Lightbulb className="w-[18px] h-[18px] text-amber-500" /> Tujuan Task
            </label>
            <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Tulis tujuanmu..." />
          </div>

          <PrioritySelector value={priority} onChange={setPriority} />

          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-neutral-900 flex items-center gap-2">
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
                <span className="text-sm font-bold text-neutral-800">{dueTime}</span>
                <Clock className="w-4.5 h-4.5 text-neutral-400" />
              </button>
            </div>
          </div>

          {/* Opsi Lanjutan - Now will work perfectly with -mx-5 */}
          <AdvancedOptions />

          {/* Meta & Danger Zone */}
          <section className="flex flex-col items-center gap-8 pt-4 pb-10">
            <div className="text-center space-y-1.5">
              <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Dibuat: {MOCK_TASK_DATA.createdAt}</p>
              <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Terakhir diupdate: {MOCK_TASK_DATA.updatedAt}</p>
            </div>
            
            <div className="w-full space-y-3.5">
              <button className="w-full py-4 rounded-2xl border border-red-100 bg-red-50 text-red-600 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                <Trash2 className="w-5 h-5" /> Hapus Tugas
              </button>
              <button className="w-full py-4 rounded-2xl border border-neutral-200 bg-white text-neutral-700 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm">
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
    </div>
  );
}

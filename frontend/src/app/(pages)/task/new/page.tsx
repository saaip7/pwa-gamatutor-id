"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Target, AlignLeft, Lightbulb, Calendar as CalendarIcon, Clock, ArrowRight, Check } from "lucide-react";
import { NewTaskHeader } from "@/components/feature/task/NewTaskHeader";
import { CourseSelector } from "@/components/feature/task/CourseSelector";
import { StrategySelector, LearningStrategy } from "@/components/feature/task/StrategySelector";
import { PrioritySelector, PriorityLevel } from "@/components/feature/task/PrioritySelector";
import { AdvancedOptions } from "@/components/feature/task/AdvancedOptions";
import { Input } from "@/components/ui/Input";
import { Drawer } from "@/components/ui/Drawer";
import { cn } from "@/lib/utils";

export default function NewTaskPage() {
  const router = useRouter();
  
  // Form State
  const [course, setCourse] = useState("");
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [strategy, setStrategy] = useState<LearningStrategy | "">("");
  const [goal, setGoal] = useState("");
  const [priority, setPriority] = useState<PriorityLevel>("Medium");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");

  // UI State for Drawers
  const [isDateDrawerOpen, setIsDateDrawerOpen] = useState(false);
  const [isTimeDrawerOpen, setIsTimeDrawerOpen] = useState(false);

  const isValid = course.trim() !== "" && taskName.trim() !== "" && strategy !== "" && goal.trim() !== "";

  const handleSave = () => {
    console.log("Saving Task:", { course, taskName, description, strategy, goal, priority, dueDate, dueTime });
    router.back();
  };

  return (
    <div className="w-full h-screen flex flex-col mx-auto bg-neutral-50 relative overflow-hidden">
      <NewTaskHeader isValid={isValid} onSave={handleSave} />

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pt-6 pb-28 relative">
        <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
          
          {/* 1. Mata Kuliah */}
          <CourseSelector 
            value={course} 
            onChange={setCourse} 
            suggestions={["Algoritma", "Basis Data", "Kalkulus"]} 
          />

          {/* 2. Nama Tugas */}
          <div className="flex flex-col gap-2">
            <label htmlFor="task_name" className="text-[14px] font-semibold text-neutral-900 flex items-center gap-2">
              <Target className="w-[18px] h-[18px] text-amber-500" /> Nama Tugas <span className="text-error">*</span>
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
            <label htmlFor="description" className="text-[14px] font-semibold text-neutral-900 flex items-center gap-2">
              <AlignLeft className="w-[18px] h-[18px] text-neutral-500" /> Deskripsi
            </label>
            <textarea 
              id="description" 
              rows={2} 
              placeholder="Deskripsi tambahan (opsional)..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-white text-[15px] placeholder:text-neutral-400 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none shadow-sm"
            ></textarea>
          </div>

          {/* 4. Strategi Belajar */}
          <StrategySelector value={strategy} onChange={setStrategy} />

          {/* 5. Tujuan Task (Now Mandatory) */}
          <div className="flex flex-col gap-2">
            <label htmlFor="goal" className="text-[14px] font-semibold text-neutral-900 flex items-center gap-2">
              <Lightbulb className="w-[18px] h-[18px] text-amber-500" /> Tujuan Task <span className="text-error">*</span>
            </label>
            
            <Input 
              id="goal" 
              placeholder="Tulis tujuanmu..." 
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
            
            <div className="mt-1 flex flex-wrap gap-2">
              {["Memahami konsep", "Persiapan UTS", "Latihan mandiri"].map(g => (
                <button 
                  key={g}
                  type="button" 
                  onClick={() => setGoal(g)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-[12px] font-medium text-neutral-600 shadow-sm active:bg-neutral-50 transition-colors"
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Prioritas */}
          <PrioritySelector value={priority} onChange={setPriority} />

          {/* 7. Deadline (Functional Drawers) */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-neutral-900 flex items-center gap-2">
              <CalendarIcon className="w-[18px] h-[18px] text-teal-500" /> Deadline Target
            </label>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button" 
                onClick={() => setIsDateDrawerOpen(true)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl border shadow-sm transition-colors text-left",
                  dueDate ? "border-primary bg-primary/5 border-2" : "border-neutral-200 bg-white active:bg-neutral-50"
                )}
              >
                <CalendarIcon className={cn("w-5 h-5", dueDate ? "text-primary" : "text-neutral-400")} />
                <span className={cn("text-[14px] font-medium", dueDate ? "text-primary font-bold" : "text-neutral-600")}>
                  {dueDate || "Pilih tgl"}
                </span>
              </button>
              <button 
                type="button" 
                onClick={() => setIsTimeDrawerOpen(true)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl border shadow-sm transition-colors text-left",
                  dueTime ? "border-primary bg-primary/5 border-2" : "border-neutral-200 bg-white active:bg-neutral-50"
                )}
              >
                <Clock className={cn("w-5 h-5", dueTime ? "text-primary" : "text-neutral-400")} />
                <span className={cn("text-[14px] font-medium", dueTime ? "text-primary font-bold" : "text-neutral-600")}>
                  {dueTime || "Pilih jam"}
                </span>
              </button>
            </div>
          </div>

          {/* 8. Opsi Lanjutan */}
          <AdvancedOptions />

        </form>
      </main>

      {/* Date Picker Drawer */}
      <Drawer 
        isOpen={isDateDrawerOpen} 
        onClose={() => setIsDateDrawerOpen(false)} 
        title="Pilih Tanggal"
      >
        <div className="grid grid-cols-1 gap-2">
          {["Hari ini", "Besok", "Lusa", "Minggu depan"].map((d) => (
            <button
              key={d}
              onClick={() => { setDueDate(d); setIsDateDrawerOpen(false); }}
              className="w-full text-left px-4 py-4 rounded-2xl hover:bg-neutral-50 font-medium text-neutral-700 flex justify-between items-center transition-colors"
            >
              {d}
              {dueDate === d && <Check className="w-5 h-5 text-primary" />}
            </button>
          ))}
        </div>
      </Drawer>

      {/* Time Picker Drawer */}
      <Drawer 
        isOpen={isTimeDrawerOpen} 
        onClose={() => setIsTimeDrawerOpen(false)} 
        title="Pilih Jam"
      >
        <div className="grid grid-cols-3 gap-3">
          {["08:00", "10:00", "13:00", "15:00", "19:00", "21:00"].map((t) => (
            <button
              key={t}
              onClick={() => { setDueTime(t); setIsTimeDrawerOpen(false); }}
              className={cn(
                "py-3 rounded-xl border text-sm font-bold transition-all",
                dueTime === t ? "bg-primary text-white border-primary shadow-md scale-105" : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </Drawer>
    </div>
  );
}

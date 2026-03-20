"use client";

import React from "react";
import { useParams } from "next/navigation";
import { 
  Calendar, 
  Flag, 
  AlignLeft, 
  CheckSquare, 
  Link as LinkIcon, 
  ExternalLink,
  Zap,
  Trophy,
  MapPin,
  Youtube,
  FileText,
  Globe
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { TaskDetailHeader } from "@/components/feature/task/TaskDetailHeader";
import { GoalSection } from "@/components/feature/task/GoalSection";
import { TaskDetailActionBar } from "@/components/feature/task/TaskDetailActionBar";
import { cn } from "@/lib/utils";

// Mock Data for Slicing
const MOCK_TASK = {
  id: "1",
  title: "Review Materi Sorting: Bubble & Insertion Sort",
  course: "Algoritma & Struktur Data",
  status: "Planning",
  goal: "Persiapan UTS & memahami konsep sorting dasar sebagai fondasi untuk struktur data yang lebih kompleks.",
  strategy: "Video Tutorial",
  bestRecord: "2j 15m",
  dueDate: "28 Feb 2025",
  priority: "High",
  description: "Tonton video penjelasan visual algoritma sorting, lalu coba implementasikan kembali menggunakan Python tanpa melihat referensi. Fokus pada perbandingan jumlah iterasi.",
  subtasks: [
    { id: "s1", text: "Nonton video bab sorting", completed: true },
    { id: "s2", text: "Catat poin penting", completed: true },
    { id: "s3", text: "Latihan implementasi Bubble Sort", completed: false },
    { id: "s4", text: "Latihan implementasi Insertion Sort", completed: false },
    { id: "s5", text: "Analisis kompleksitas waktu", completed: false },
  ],
  links: [
    { id: "l1", title: "Visualgo: Sorting Visualization", url: "visualgo.net/en/sorting", type: "web" },
    { id: "l2", title: "Sorting Algorithm Document.pdf", url: "Google Drive Reference", type: "file" },
  ]
};

export default function TaskDetailPage() {
  const params = useParams();
  
  // State for Task (to allow interactivity in slicing)
  const [task, setTask] = React.useState(MOCK_TASK);

  const toggleSubtask = (subtaskId: string) => {
    setTask(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(s => 
        s.id === subtaskId ? { ...s, completed: !s.completed } : s
      )
    }));
  };

  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
  const progressPercent = (completedSubtasks / task.subtasks.length) * 100;

  return (
    <div className="w-full h-screen flex flex-col mx-auto bg-white relative overflow-hidden max-w-md">
      <TaskDetailHeader />

      <main className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 space-y-8 pb-32">
        
        {/* Section 1: Title & Status */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="blue" icon={MapPin}>
              {task.status}
            </Badge>
            <span className="text-[11px] font-bold text-neutral-400">•</span>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              {task.course}
            </span>
          </div>
          
          <h2 className="text-[28px] font-black text-neutral-900 leading-[1.15] tracking-tight">
            {task.title}
          </h2>

          <GoalSection goal={task.goal} />
        </section>

        {/* Section 2: Strategy & Records (Ref 06 Style) */}
        <section className="flex flex-wrap gap-2.5">
          <Badge variant="purple" icon={Zap}>
            Strategy: {task.strategy}
          </Badge>
          <Badge variant="emerald" icon={Trophy}>
            Best: {task.bestRecord}
          </Badge>
        </section>

        {/* Section 3: Info Grid */}
        <section className="grid grid-cols-2 gap-3">
          <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 flex flex-col gap-1.5 shadow-sm">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Due Date
            </span>
            <span className="text-[14px] font-bold text-neutral-900">
              {task.dueDate}
            </span>
          </div>
          <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 flex flex-col gap-1.5 shadow-sm">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5" /> Priority
            </span>
            <span className={cn(
              "text-[14px] font-bold",
              task.priority === "High" ? "text-error" : "text-amber-600"
            )}>
              {task.priority} Priority
            </span>
          </div>
        </section>

        {/* Section 4: Description */}
        <section className="space-y-3">
          <h3 className="text-[13px] font-bold text-neutral-900 flex items-center gap-2 uppercase tracking-wider">
            <AlignLeft className="w-4 h-4 text-neutral-400" />
            Description
          </h3>
          <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100 leading-relaxed text-[14px] text-neutral-600 font-medium">
            {task.description}
          </div>
        </section>

        {/* Section 5: Subtasks */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-bold text-neutral-900 flex items-center gap-2 uppercase tracking-wider">
              <CheckSquare className="w-4 h-4 text-neutral-400" />
              Subtasks
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-20 h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <span className="text-[11px] font-bold text-neutral-500">
                {completedSubtasks}/{task.subtasks.length}
              </span>
            </div>
          </div>
          
          <div className="space-y-2.5">
            {task.subtasks.map((subtask) => (
              <button 
                key={subtask.id}
                type="button"
                onClick={() => toggleSubtask(subtask.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left active:scale-[0.98]",
                  subtask.completed 
                    ? "bg-neutral-50 border-neutral-100 opacity-60 shadow-none" 
                    : "bg-white border-neutral-200 shadow-sm"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                  subtask.completed 
                    ? "bg-primary border-primary text-white" 
                    : "border-neutral-300"
                )}>
                  {subtask.completed && <CheckSquare className="w-3.5 h-3.5" />}
                </div>
                <span className={cn(
                  "text-[14px] font-medium transition-all",
                  subtask.completed ? "text-neutral-400 line-through" : "text-neutral-800"
                )}>
                  {subtask.text}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Section 6: References */}
        <section className="space-y-3">
          <h3 className="text-[13px] font-bold text-neutral-900 flex items-center gap-2 uppercase tracking-wider">
            <LinkIcon className="w-4 h-4 text-neutral-400" />
            References
          </h3>
          <div className="grid gap-3">
            {task.links.map((link) => (
              <a 
                key={link.id}
                href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 p-4 bg-white border border-neutral-200 rounded-2xl active:scale-[0.98] transition-all shadow-sm group"
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                  link.url.includes("visualgo") ? "bg-blue-50 border-blue-100 text-primary" : "bg-red-50 border-red-100 text-error"
                )}>
                  {link.url.includes("visualgo") ? <Globe className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-neutral-900 truncate group-hover:text-primary transition-colors">
                    {link.title}
                  </p>
                  <p className="text-[11px] text-neutral-400 truncate mt-0.5 font-medium">
                    {link.url}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-neutral-300 group-hover:text-primary transition-colors" />
              </a>
            ))}
          </div>
        </section>

      </main>

      <TaskDetailActionBar status={task.status} />
    </div>
  );
}

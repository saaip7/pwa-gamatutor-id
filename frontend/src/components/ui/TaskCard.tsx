import React from "react";
import Link from "next/link";
import { Check, Clock, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  progressText: string;
  progressPercent: number; // e.g., 60 for 3/5
  subtasks: Subtask[];
  priority: "High" | "Medium" | "Low";
  time: string;
  tag?: string;
  href?: string;
}

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const priorityStyles = {
    High: "bg-red-50 text-error border-red-100/50",
    Medium: "bg-yellow-50 text-warning border-yellow-100/50",
    Low: "bg-green-50 text-success border-green-100/50",
  };

  return (
    <Link
      href={task.href || `/task/${task.id}`}
      className="block bg-white rounded-[24px] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] border border-neutral-100 overflow-hidden active:scale-[0.98] transition-transform"
    >
      {/* ROW 1: Title & Progress Bar */}
      <div className="relative p-4 pb-3">
        <div 
          className="absolute inset-0 bg-blue-50/60 z-0 rounded-r-3xl transition-all duration-500" 
          style={{ width: `${task.progressPercent}%` }}
        ></div>
        <div className="relative z-10 flex justify-between items-start gap-4">
          <h4 className="text-[15px] font-bold text-neutral-900 leading-snug pt-0.5">{task.title}</h4>
          <span className="text-[11px] font-bold text-primary bg-white px-2 py-1 rounded-[8px] border border-blue-100 shrink-0 shadow-sm">
            {task.progressText}
          </span>
        </div>
      </div>
      
      {/* ROW 2: Subtask Checklists */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="px-4 py-3 bg-white space-y-2.5 border-t border-neutral-50">
          {task.subtasks.slice(0, 3).map((subtask) => (
            <div key={subtask.id} className="flex items-start gap-3">
              {subtask.isCompleted ? (
                <div className="mt-0.5 shrink-0 w-4 h-4 rounded-[5px] border border-neutral-200 flex items-center justify-center bg-neutral-50">
                  <Check className="w-2.5 h-2.5 text-neutral-400" />
                </div>
              ) : (
                <div className="mt-0.5 shrink-0 w-4 h-4 rounded-[5px] border-[1.5px] border-primary flex items-center justify-center bg-white shadow-[0_2px_4px_rgba(59,130,246,0.1)]"></div>
              )}
              <span className={cn(
                "text-[13px]",
                subtask.isCompleted ? "font-medium text-neutral-400 line-through" : "font-semibold text-neutral-700"
              )}>
                {subtask.title}
              </span>
            </div>
          ))}
          {task.subtasks.length > 3 && (
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0 w-4 h-4 rounded-[5px] border-[1.5px] border-neutral-300 flex items-center justify-center bg-white"></div>
              <span className="text-[13px] font-medium text-neutral-500">+{task.subtasks.length - 3} more subtasks</span>
            </div>
          )}
        </div>
      )}

      {/* ROW 3: Metadata */}
      <div className="px-4 py-3.5 bg-neutral-50/80 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100/80">
        <div className="flex items-center gap-2.5">
          <span className={cn("px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border", priorityStyles[task.priority])}>
            {task.priority}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 bg-white px-2 py-1.5 rounded-[10px] border border-neutral-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.02)]">
            <Clock className="w-[13px] h-[13px] text-neutral-400" />
            {task.time}
          </div>
        </div>
        {task.tag && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[10px] bg-white border border-neutral-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.02)] flex items-center justify-center text-neutral-400">
              <Link2 className="w-[13px] h-[13px]" />
            </div>
            <span className="px-2.5 py-1.5 bg-amber-50 text-warning text-[10px] font-bold uppercase tracking-wider rounded-[10px] border border-yellow-100/50">
              {task.tag}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

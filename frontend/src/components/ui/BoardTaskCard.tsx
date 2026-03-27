import React from "react";
import Link from "next/link";
import { Check, Clock, Link2, CheckSquare, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "./TaskCard"; // Reuse the same interface

interface BoardTaskCardProps {
  task: Task;
  statusColorClass: string; // e.g., 'border-l-error'
  progressBgClass: string; // e.g., 'bg-blue-50'
  isCompleted?: boolean;
}

export function BoardTaskCard({ task, statusColorClass, progressBgClass, isCompleted = false }: BoardTaskCardProps) {
  // SOLID Backgrounds for Priority
  const priorityStyles = {
    High: "bg-red-500 text-white shadow-sm",
    Medium: "bg-amber-500 text-white shadow-sm",
    Low: "bg-slate-500 text-white shadow-sm",
  };

  // LIGHT Backgrounds for Difficulty
  const difficultyStyles = {
    Hard: "bg-rose-100 text-rose-700 border border-rose-200 shadow-sm",
    Medium: "bg-blue-100 text-blue-700 border border-blue-200 shadow-sm",
    Easy: "bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm",
  };
  
  return (
    <Link
      href={task.href || `/task/${task.id}`}
      className={cn(
        "block bg-white rounded-2xl border border-neutral-200 border-l-4 shadow-sm overflow-hidden active:scale-[0.98] transition-all flex flex-col",
        statusColorClass,
        isCompleted && "opacity-70"
      )}
    >
      <div className="relative px-4 py-3 border-b border-neutral-100">
        <div 
          className={cn("absolute inset-y-0 left-0 transition-all z-0", progressBgClass)} 
          style={{ width: `${task.progressPercent}%` }}
        ></div>
        <div className="relative z-10 flex justify-between items-center gap-2">
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <h3 className={cn("font-semibold text-sm truncate", isCompleted ? "text-neutral-500 line-through" : "text-neutral-800")}>
              {task.title}
            </h3>
            {task.course && (
              <p className={cn("text-xs truncate", isCompleted ? "text-neutral-400 line-through" : "text-neutral-500")}>
                {task.course}
              </p>
            )}
          </div>
          {!isCompleted && (
            <span className="text-[11px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
              {task.progressText}
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        {task.description && (
          <p className="text-xs text-neutral-500 line-clamp-3 leading-relaxed mb-3">
            {task.description}
          </p>
        )}
        
        {/* Reusing Dashboard-style Subtasks for Board */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="space-y-2.5">
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
                  "text-sm",
                  subtask.isCompleted ? "font-medium text-neutral-400 line-through" : "font-semibold text-neutral-700"
                )}>
                  {subtask.title}
                </span>
              </div>
            ))}
            {task.subtasks.length > 3 && (
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0 w-4 h-4 rounded-[5px] border-[1.5px] border-neutral-300 flex items-center justify-center bg-white"></div>
                <span className="text-sm font-medium text-neutral-500">+{task.subtasks.length - 3} more subtasks</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-4 py-3 bg-neutral-50 flex items-center gap-2 border-t border-neutral-100 mt-auto">
        <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide shadow-sm", priorityStyles[task.priority])}>
          {task.priority}
        </span>
        <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide shadow-sm", difficultyStyles[task.difficulty])}>
          {task.difficulty}
        </span>
        
        {isCompleted ? (
          <div className="flex items-center gap-1 text-[11px] text-success font-medium ml-1">
             <Check className="w-3.5 h-3.5" />
             <span>Completed</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-medium ml-1">
             <Clock className="w-3.5 h-3.5" />
             <span>{task.time}</span>
          </div>
        )}
        
        <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-medium ml-auto">
            <Link2 className="w-3 h-3" />
            <span>{task.subtasks?.length || 0}</span>
        </div>
      </div>
    </Link>
  );
}

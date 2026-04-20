import React from "react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

export interface CourseGoal {
  id: string;
  title: string;
  icon: string;
  completedTasks: number;
  totalTasks: number;
  theme: "blue" | "teal" | "purple";
}

interface CourseGoalCardProps {
  goal: CourseGoal;
}

function getMicroFrame(completed: number, total: number): string | null {
  if (total === 0) return null;
  const pct = Math.round((completed / total) * 100);
  if (pct === 100) return "Tuntas!";
  if (pct >= 80) return "Hampir selesai!";
  if (pct >= 50) return "Lebih dari setengah jalan";
  if (pct > 0) return null;
  return null;
}

export function CourseGoalCard({ goal }: CourseGoalCardProps) {
  const percentage = Math.round((goal.completedTasks / goal.totalTasks) * 100) || 0;
  const microFrame = getMicroFrame(goal.completedTasks, goal.totalTasks);

  const themeStyles = {
    blue: {
      wrapper: "border-blue-100 bg-blue-50/50 hover:bg-blue-50",
      iconBg: "bg-blue-100 text-blue-600",
      progressBg: "bg-blue-100/50",
      progressFill: "bg-blue-500",
    },
    teal: {
      wrapper: "border-teal-100 bg-teal-50/50 hover:bg-teal-50",
      iconBg: "bg-teal-100 text-teal-600",
      progressBg: "bg-teal-100/50",
      progressFill: "bg-teal-500",
    },
    purple: {
      wrapper: "border-purple-100 bg-purple-50/50 hover:bg-purple-50",
      iconBg: "bg-purple-100 text-purple-600",
      progressBg: "bg-purple-100/50",
      progressFill: "bg-purple-500",
    },
  };

  const styles = themeStyles[goal.theme];
  const Icon = (LucideIcons as any)[goal.icon] || LucideIcons.FileQuestion;

  return (
    <div className={cn("block p-4 rounded-xl border transition-all duration-300 cursor-pointer group hover:shadow-md", styles.wrapper)}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300", styles.iconBg)}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h4 className="font-semibold text-neutral-800">{goal.title}</h4>
            {microFrame && (
              <span className="text-[10px] font-bold text-emerald-600">{microFrame}</span>
            )}
          </div>
        </div>
        <span className="text-xs font-medium text-neutral-500 bg-white/60 px-2 py-1 rounded-md border border-neutral-100">
          {goal.completedTasks}/{goal.totalTasks} tugas
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className={cn("flex-1 h-2 rounded-full overflow-hidden", styles.progressBg)}>
          <div className={cn("h-full rounded-full transition-all duration-500", styles.progressFill)} style={{ width: `${percentage}%` }}></div>
        </div>
        <span className="text-xs font-bold text-neutral-500 w-8 text-right">{percentage}%</span>
      </div>
    </div>
  );
}

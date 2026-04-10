"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  FileText,
  Globe,
  Youtube,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { TaskDetailHeader } from "@/components/feature/task/TaskDetailHeader";
import { GoalSection } from "@/components/feature/task/GoalSection";
import { TaskDetailActionBar } from "@/components/feature/task/TaskDetailActionBar";
import { cn } from "@/lib/utils";
import { useBoardStore } from "@/stores/board";
import type { BoardCard } from "@/types";

const COLUMN_STATUS_MAP: Record<string, string> = {
  list1: "Planning",
  list2: "Monitoring",
  list3: "Controlling",
  list4: "Reflection",
};

function formatDeadline(deadline?: string): string {
  if (!deadline) return "No deadline";
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return deadline;
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPersonalBest(pb: BoardCard["personal_best"]): string {
  if (!pb) return "—";
  if (typeof pb === "string") return pb;
  if (pb.duration_ms) {
    const totalMin = Math.floor(pb.duration_ms / 60000);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return h > 0 ? `${h}j ${m}m` : `${m}m`;
  }
  return "—";
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const fetchCardDetail = useBoardStore((s) => s.fetchCardDetail);
  const updateCard = useBoardStore((s) => s.updateCard);

  const [card, setCard] = useState<(BoardCard & { list_title?: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchCardDetail(id)
      .then((data) => {
        setCard(data);
      })
      .catch(() => {
        setCard(null);
      })
      .finally(() => setLoading(false));
  }, [id, fetchCardDetail]);

  const toggleChecklist = async (checklistId: string) => {
    if (!card) return;
    const updatedChecklists = (card.checklists || []).map((item) =>
      item.id === checklistId ? { ...item, isCompleted: !item.isCompleted } : item
    );
    setCard({ ...card, checklists: updatedChecklists });
    try {
      await updateCard(id, { checklists: updatedChecklists });
    } catch {
      // Revert on failure
      setCard({ ...card, checklists: card.checklists });
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white max-w-md mx-auto">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-white max-w-md mx-auto gap-3">
        <p className="text-sm text-neutral-500 font-medium">Task tidak ditemukan</p>
        <button
          onClick={() => router.back()}
          className="text-sm text-primary font-bold"
        >
          Kembali
        </button>
      </div>
    );
  }

  const status = COLUMN_STATUS_MAP[card.column || "list1"] || "Planning";
  const checklists = card.checklists || [];
  const completedCount = checklists.filter((s) => s.isCompleted).length;
  const progressPercent = checklists.length > 0 ? (completedCount / checklists.length) * 100 : 0;
  const goalText = card.goal_check?.goal_text || "";

  return (
    <div className="w-full h-screen flex flex-col mx-auto bg-white relative overflow-hidden max-w-md">
      <TaskDetailHeader />

      <main className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 space-y-8 pb-32">
        {/* Section 1: Title & Status */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="blue" icon={MapPin}>
              {status}
            </Badge>
            {card.course_name && (
              <>
                <span className="text-[11px] font-bold text-neutral-400">•</span>
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  {card.course_name}
                </span>
              </>
            )}
          </div>

          <h2 className="text-2xl font-black text-neutral-900 leading-[1.15] tracking-tight">
            {card.task_name}
          </h2>

          <GoalSection goal={goalText || "Belum ada tujuan"} />
        </section>

        {/* Section 2: Strategy & Records */}
        <section className="flex flex-wrap gap-2.5">
          <Badge variant="purple" icon={Zap}>
            {card.learning_strategy || "No strategy"}
          </Badge>
          <Badge variant="emerald" icon={Trophy}>
            Best: {formatPersonalBest(card.personal_best) || "—"}
          </Badge>
        </section>

        {/* Section 3: Info Grid */}
        <section className="grid grid-cols-2 gap-3">
          <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 flex flex-col gap-1.5 shadow-sm">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Due Date
            </span>
            <span className="text-sm font-bold text-neutral-900">
              {formatDeadline(card.deadline)}
            </span>
          </div>
          <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 flex flex-col gap-1.5 shadow-sm">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5" /> Priority
            </span>
            <span
              className={cn(
                "text-sm font-bold",
                card.priority === "High"
                  ? "text-error"
                  : card.priority === "Medium"
                    ? "text-amber-600"
                    : "text-neutral-600"
              )}
            >
              {card.priority || "Medium"} Priority
            </span>
          </div>
        </section>

        {/* Section 4: Description */}
        {card.description && (
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 uppercase tracking-wider">
              <AlignLeft className="w-4 h-4 text-neutral-400" />
              Description
            </h3>
            <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100 leading-relaxed text-sm text-neutral-600 font-medium">
              {card.description}
            </div>
          </section>
        )}

        {/* Section 5: Checklists / Subtasks */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 uppercase tracking-wider">
              <CheckSquare className="w-4 h-4 text-neutral-400" />
              Subtasks
            </h3>
            {checklists.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="w-20 h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <span className="text-[11px] font-bold text-neutral-500">
                  {completedCount}/{checklists.length}
                </span>
              </div>
            )}
          </div>

          {checklists.length > 0 ? (
            <div className="space-y-2.5">
              {checklists.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleChecklist(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left active:scale-[0.98]",
                    item.isCompleted
                      ? "bg-neutral-50 border-neutral-100 opacity-60 shadow-none"
                      : "bg-white border-neutral-200 shadow-sm"
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                      item.isCompleted
                        ? "bg-primary border-primary text-white"
                        : "border-neutral-300"
                    )}
                  >
                    {item.isCompleted && <CheckSquare className="w-3.5 h-3.5" />}
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium transition-all",
                      item.isCompleted
                        ? "text-neutral-400 line-through"
                        : "text-neutral-800"
                    )}
                  >
                    {item.title}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-neutral-50 rounded-2xl p-5 border border-dashed border-neutral-200 text-center">
              <p className="text-xs text-neutral-400 font-medium">Belum ada subtask</p>
            </div>
          )}
        </section>

        {/* Section 6: References / Links */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 uppercase tracking-wider">
            <LinkIcon className="w-4 h-4 text-neutral-400" />
            References
          </h3>
          {card.links && card.links.length > 0 ? (
            <div className="grid gap-3">
              {card.links.map((link, idx) => (
                <a
                  key={link.id || idx}
                  href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 p-4 bg-white border border-neutral-200 rounded-2xl active:scale-[0.98] transition-all shadow-sm group"
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                      link.url.includes("youtube") || link.url.includes("youtu.be")
                        ? "bg-red-50 border-red-100 text-error"
                        : link.url.includes("visualgo") || link.url.includes("github")
                          ? "bg-blue-50 border-blue-100 text-primary"
                          : "bg-emerald-50 border-emerald-100 text-emerald-600"
                    )}
                  >
                    {link.url.includes("youtube") || link.url.includes("youtu.be") ? (
                      <Youtube className="w-5 h-5" />
                    ) : link.url.includes("visualgo") ? (
                      <Globe className="w-5 h-5" />
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-neutral-900 truncate group-hover:text-primary transition-colors">
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
          ) : (
            <div className="bg-neutral-50 rounded-2xl p-5 border border-dashed border-neutral-200 text-center">
              <p className="text-xs text-neutral-400 font-medium">Belum ada reference</p>
            </div>
          )}
        </section>
      </main>

      <TaskDetailActionBar taskId={id} status={status} />
    </div>
  );
}

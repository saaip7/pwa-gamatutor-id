"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Plus, BookOpen, Zap } from "lucide-react";
import Link from "next/link";
import type { CourseGoal } from "./CourseGoalCard";

interface NextStepCardProps {
  courses: CourseGoal[];
}

export function NextStepCard({ courses }: NextStepCardProps) {
  const incompleteCourses = courses.filter((c) => c.completedTasks < c.totalTasks);
  const courseWithoutTasks = courses.filter((c) => c.totalTasks === 0);

  let icon: React.ReactNode;
  let title: string;
  let description: string;
  let href: string;
  let accentColor: string;

  if (courses.length === 0) {
    icon = <Plus className="w-5 h-5" />;
    title = "Mulai dengan Tugas Pertama";
    description = "Buat tugas pertamamu dan mulai perjalanan belajar menuju tujuanmu.";
    href = "/task/new";
    accentColor = "text-primary bg-primary/10 border-primary/20";
  } else if (courseWithoutTasks.length > 0) {
    icon = <BookOpen className="w-5 h-5" />;
    title = `Tambah tugas untuk ${courseWithoutTasks[0].title}`;
    description = `${courseWithoutTasks[0].title} belum punya tugas. Mulai tambahkan untuk memantau progresnya.`;
    href = "/task/new";
    accentColor = "text-purple-600 bg-purple-50 border-purple-100";
  } else {
    const lowest = incompleteCourses
      .filter((c) => c.totalTasks > 0)
      .sort(
        (a, b) => (a.completedTasks / a.totalTasks) - (b.completedTasks / b.totalTasks)
      )[0];
    if (!lowest) {
      icon = <BookOpen className="w-5 h-5" />;
      title = "Kembali ke Board";
      description = "Lihat semua tugasmu dan lanjutkan mengerjakan.";
      href = "/board";
      accentColor = "text-neutral-600 bg-neutral-50 border-neutral-100";
    } else {
      const pct = Math.round((lowest.completedTasks / lowest.totalTasks) * 100);
      icon = <Zap className="w-5 h-5" />;
      title = `Lanjutkan ${lowest.title}`;
      description = `Progres ${pct}% — ${lowest.completedTasks} dari ${lowest.totalTasks} tugas selesai. Ayo tuntaskan!`;
      href = "/board";
      accentColor = "text-amber-600 bg-amber-50 border-amber-100";
    }
  }

  return (
    <motion.div 
      className="mt-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <h3 className="text-sm font-bold text-neutral-800 mb-3">Langkah Selanjutnya</h3>
      <Link href={href}>
        <div className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer group transition-all hover:shadow-md active:scale-[0.99] ${accentColor}`}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-neutral-900 leading-snug truncate">{title}</h4>
            <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed line-clamp-2">{description}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>
      </Link>
    </motion.div>
  );
}

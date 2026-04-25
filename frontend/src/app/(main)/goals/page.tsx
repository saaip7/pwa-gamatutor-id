"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus } from "lucide-react";
import { GoalsHeader } from "@/components/feature/goals/GoalsHeader";
import { MainGoalCard } from "@/components/feature/goals/MainGoalCard";
import { NextStepCard } from "@/components/feature/goals/NextStepCard";
import { CourseGoalsList } from "@/components/feature/goals/CourseGoalsList";
import { CourseGoal } from "@/components/feature/goals/CourseGoalCard";
import { useGoalsStore } from "@/stores/goals";

const THEME_CYCLE: Array<"blue" | "teal" | "purple"> = ["blue", "teal", "purple"];

export default function GoalsPage() {
  const { generalGoal, courses, loading, fetchGoals } = useGoalsStore();

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const mappedCourses: CourseGoal[] = courses.map((c, i) => ({
    id: c.id,
    title: c.name,
    icon: "BookOpen",
    completedTasks: c.completed_tasks,
    totalTasks: c.total_tasks,
    theme: THEME_CYCLE[i % THEME_CYCLE.length],
  }));

  const totalCompleted = courses.reduce((sum, c) => sum + c.completed_tasks, 0);
  const totalTasks = courses.reduce((sum, c) => sum + c.total_tasks, 0);

  return (
    <>
      <GoalsHeader />

      <div className="px-6 pb-24">
        <MainGoalCard
          goalTextPre={generalGoal?.text_pre ?? ""}
          goalTextHighlight={generalGoal?.text_highlight ?? ""}
          totalCompleted={totalCompleted}
          totalTasks={totalTasks}
        />

        <NextStepCard courses={mappedCourses} />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : mappedCourses.length > 0 ? (
          <CourseGoalsList goals={mappedCourses} />
        ) : (
          <motion.div 
            className="mt-8 text-center py-10"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="text-sm text-neutral-400 mb-4">Belum ada data mata kuliah.</p>
            <Link
              href="/task/new"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              Buat Tugas Pertama
            </Link>
          </motion.div>
        )}
      </div>
    </>
  );
}

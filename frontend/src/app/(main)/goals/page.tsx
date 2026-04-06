"use client";

import React, { useEffect } from "react";
import { GoalsHeader } from "@/components/feature/goals/GoalsHeader";
import { MainGoalCard } from "@/components/feature/goals/MainGoalCard";
import { CourseGoalsList } from "@/components/feature/goals/CourseGoalsList";
import { CourseGoal } from "@/components/feature/goals/CourseGoalCard";
import { useGoalsStore } from "@/stores/goals";

const THEME_CYCLE: Array<"blue" | "teal" | "purple"> = ["blue", "teal", "purple"];

export default function GoalsPage() {
  const { generalGoal, courses, loading, fetchGoals } = useGoalsStore();

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // Map CourseProgress[] -> CourseGoal[]
  const mappedCourses: CourseGoal[] = courses.map((c, i) => ({
    id: c.id,
    title: c.name,
    icon: "BookOpen", // default icon; could be per-course later
    completedTasks: c.completedTasks,
    totalTasks: c.totalTasks,
    theme: THEME_CYCLE[i % THEME_CYCLE.length],
  }));

  return (
    <>
      <GoalsHeader />

      <div className="px-6 pb-24">
        <MainGoalCard
          goalTextPre={generalGoal?.textPre ?? ""}
          goalTextHighlight={generalGoal?.textHighlight ?? ""}
        />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : mappedCourses.length > 0 ? (
          <CourseGoalsList goals={mappedCourses} />
        ) : (
          <div className="text-center py-12 text-neutral-400 text-sm">
            Belum ada data mata kuliah
          </div>
        )}
      </div>
    </>
  );
}

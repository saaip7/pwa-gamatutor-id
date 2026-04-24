"use client";

import React from "react";
import { motion } from "framer-motion";
import { CourseGoalCard, CourseGoal } from "./CourseGoalCard";

interface CourseGoalsListProps {
  goals: CourseGoal[];
}

export function CourseGoalsList({ goals }: CourseGoalsListProps) {
  return (
    <motion.div 
      className="mt-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mb-4">
        <h3 className="text-lg md:text-xl font-bold text-neutral-800">Progress Mata Kuliah</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {goals.map((goal) => (
          <CourseGoalCard key={goal.id} goal={goal} />
        ))}
      </div>
    </motion.div>
  );
}

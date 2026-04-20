"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TaskCard, Task } from "@/components/ui/TaskCard";

interface TodayTasksListProps {
  tasks: Task[];
}

export function TodayTasksList({ tasks }: TodayTasksListProps) {
  return (
    <motion.div 
      className="px-6 mb-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex justify-between items-center mb-5 px-1">
        <h3 className="text-lg md:text-xl font-bold text-neutral-900 tracking-tight">Tugas Hari Ini</h3>
        <Link 
          href="/board" 
          className="text-sm font-bold text-primary flex items-center gap-1 hover:text-primary-hover transition-colors"
        >
          Lihat Board 
          <ArrowRight className="w-[15px] h-[15px]" />
        </Link>
      </div>
      
      <div className="space-y-4">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        ) : (
          <p className="text-sm text-neutral-500 text-center py-4">Belum ada tugas untuk hari ini.</p>
        )}
      </div>
    </motion.div>
  );
}

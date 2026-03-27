"use client";

import React from "react";
import { motion } from "framer-motion";

interface SettingsGroupProps {
  title: string;
  delay?: number;
  children: React.ReactNode;
}

export function SettingsGroup({ title, delay = 0, children }: SettingsGroupProps) {
  return (
    <motion.div 
      className="mb-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <h3 className="text-xs font-bold text-neutral-500 tracking-wider mb-3 px-2">
        {title}
      </h3>
      <div className="bg-white rounded-[24px] border border-neutral-100 shadow-sm overflow-hidden flex flex-col">
        {children}
      </div>
    </motion.div>
  );
}

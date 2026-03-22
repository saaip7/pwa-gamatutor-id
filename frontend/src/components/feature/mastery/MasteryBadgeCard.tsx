"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { MasteryBadgeIcon, BadgeShape } from "./MasteryBadgeIcon";
import { LucideIcon } from "lucide-react";

interface MasteryBadgeCardProps {
  title: string;
  description: string;
  shape: BadgeShape;
  icon: LucideIcon;
  isUnlocked?: boolean;
}

export function MasteryBadgeCard({ title, description, shape, icon, isUnlocked = false }: MasteryBadgeCardProps) {
  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ y: -1 }}
      className={cn(
        "relative flex flex-col items-center text-center p-4 rounded-[32px] border transition-all duration-300 outline-none",
        isUnlocked 
          ? "bg-gradient-to-br from-white to-neutral-50 border-neutral-100 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)]" 
          : "bg-neutral-50/50 border-neutral-100/50 opacity-80"
      )}
    >
      {/* Status Indicator */}
      <div className={cn(
        "absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center border z-10",
        isUnlocked 
          ? "bg-white text-emerald-500 border-emerald-100 shadow-sm" 
          : "bg-neutral-100 text-neutral-400 border-neutral-200"
      )}>
        {isUnlocked ? <Check className="w-3 h-3 stroke-[3]" /> : <Lock className="w-2.5 h-2.5" />}
      </div>

      {/* SVG Icon Area */}
      <div className={cn(
        "w-20 h-20 relative mb-3 mt-1 transition-all duration-500",
        !isUnlocked && "grayscale contrast-125 brightness-75 opacity-60"
      )}>
        <MasteryBadgeIcon shape={shape} icon={icon} />
      </div>

      {/* Text Info */}
      <h4 className={cn(
        "font-bold text-[13px] leading-tight mb-1",
        isUnlocked ? "text-neutral-900" : "text-neutral-500"
      )}>
        {title}
      </h4>
      <p className="text-[10px] text-neutral-400 leading-relaxed line-clamp-2 px-1">
        {description}
      </p>

      {/* Decorative Shine (Only for Unlocked) */}
      {isUnlocked && (
        <div className="absolute inset-0 rounded-[32px] bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
      )}
    </motion.button>
  );
}

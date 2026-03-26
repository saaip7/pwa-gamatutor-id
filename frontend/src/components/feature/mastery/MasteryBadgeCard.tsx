"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { MasteryBadgeIcon, BadgeShape } from "./MasteryBadgeIcon";
import { LucideIcon } from "lucide-react";

interface MasteryBadgeCardProps {
  title: string;
  description: string;
  shape: BadgeShape;
  icon: LucideIcon;
  isUnlocked?: boolean;
  onClick?: () => void;
}

export function MasteryBadgeCard({ title, description, shape, icon, isUnlocked = false, onClick }: MasteryBadgeCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={isUnlocked ? { y: -4 } : { y: -1 }}
      whileTap={isUnlocked ? { y: -1 } : undefined}
      className={cn(
        "spotlight-card relative flex flex-col items-center text-center p-4 rounded-[24px] border outline-none",
        isUnlocked
          ? "bg-gradient-to-br from-white to-neutral-50 border-neutral-100 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)]"
          : "bg-gradient-to-br from-white to-neutral-50/80 border-neutral-100"
      )}
    >
      {/* Check indicator — only for unlocked */}
      {isUnlocked && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white flex items-center justify-center border border-emerald-100 text-emerald-500 shadow-sm z-10">
          <Check className="w-3 h-3 stroke-[3]" />
        </div>
      )}

      {/* SVG Badge */}
      <div className="w-[76px] h-[76px] relative mb-3 mt-1">
        <MasteryBadgeIcon shape={shape} icon={icon} locked={!isUnlocked} />
      </div>

      {/* Text Info */}
      <h4 className={cn(
        "font-bold text-[13px] leading-tight",
        isUnlocked ? "text-neutral-900" : "text-neutral-500"
      )}>
        {title}
      </h4>
      <p className={cn(
        "text-[10px] leading-relaxed line-clamp-2 px-1 mt-1",
        isUnlocked ? "text-neutral-500" : "text-neutral-400"
      )}>
        {description}
      </p>
    </motion.button>
  );
}

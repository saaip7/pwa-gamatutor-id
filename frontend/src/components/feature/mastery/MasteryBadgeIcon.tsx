"use client";

import React from "react";
import { LucideIcon, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export type BadgeShape = "diamond" | "hexagon" | "circle" | "shield";

interface MasteryBadgeIconProps {
  shape: BadgeShape;
  icon: LucideIcon;
  locked?: boolean;
  className?: string;
  iconClassName?: string;
}

export function MasteryBadgeIcon({ shape, icon: Icon, locked = false, className, iconClassName }: MasteryBadgeIconProps) {
  const shapeMap = {
    diamond: "#badge-diamond",
    hexagon: "#badge-hexagon",
    circle: "#badge-circle",
    shield: "#badge-shield",
  };

  return (
    <div className={cn(
      "relative w-full h-full badge-svg-container transition-all duration-500",
      locked && "badge-locked",
      className
    )}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <use href={shapeMap[shape]} />
      </svg>
      {locked ? (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="w-8 h-8 rounded-full bg-neutral-900/60 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <Lock className="w-4 h-4 text-neutral-100" />
          </div>
        </div>
      ) : (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center text-white icon-glow",
          shape === "shield" ? "pt-1" : "",
          iconClassName
        )}>
          <Icon className={cn(
            "w-[35%] h-[35%]",
            shape === "shield" ? "w-[40%] h-[40%]" : ""
          )} strokeWidth={2.5} />
        </div>
      )}
    </div>
  );
}

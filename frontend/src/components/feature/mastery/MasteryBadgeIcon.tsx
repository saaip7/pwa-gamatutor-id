"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type BadgeShape = "diamond" | "hexagon" | "circle" | "shield";

interface MasteryBadgeIconProps {
  shape: BadgeShape;
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
}

export function MasteryBadgeIcon({ shape, icon: Icon, className, iconClassName }: MasteryBadgeIconProps) {
  const shapeMap = {
    diamond: "#badge-diamond",
    hexagon: "#badge-hexagon",
    circle: "#badge-circle",
    shield: "#badge-shield",
  };

  return (
    <div className={cn("relative w-full h-full", className)}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <use href={shapeMap[shape]} />
      </svg>
      <div className={cn(
        "absolute inset-0 flex items-center justify-center text-white",
        shape === "shield" ? "pt-1" : "",
        iconClassName
      )}>
        <Icon className={cn(
          "w-[35%] h-[35%]",
          shape === "shield" ? "w-[40%] h-[40%]" : ""
        )} strokeWidth={2.5} />
      </div>
    </div>
  );
}

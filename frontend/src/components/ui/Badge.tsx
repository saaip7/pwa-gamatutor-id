"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type BadgeVariant = "blue" | "purple" | "emerald" | "orange" | "red" | "neutral" | "amber";

interface BadgeProps {
  children: React.ReactNode;
  icon?: LucideIcon;
  variant?: BadgeVariant;
  className?: string;
  size?: "sm" | "md";
  uppercase?: boolean;
}

export function Badge({ 
  children, 
  icon: Icon, 
  variant = "neutral", 
  className,
  size = "md",
  uppercase = true
}: BadgeProps) {
  const variants = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-600 border-red-100",
    neutral: "bg-neutral-100 text-neutral-600 border-neutral-200",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-3 py-1.5 text-[11px]",
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 font-bold border rounded-lg tracking-wider transition-colors",
      variants[variant],
      sizes[size],
      uppercase && "uppercase",
      className
    )}>
      {Icon && <Icon className={cn(size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5")} />}
      {children}
    </span>
  );
}

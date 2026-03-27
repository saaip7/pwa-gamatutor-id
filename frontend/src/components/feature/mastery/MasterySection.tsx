"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface MasterySectionProps {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  children: React.ReactNode;
}

export function MasterySection({ title, icon: Icon, iconColor, children }: MasterySectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex justify-between items-end border-b border-neutral-100 pb-3 mx-1">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center border border-neutral-50`}>
            <Icon className={`w-4 h-4 ${iconColor}`} />
          </div>
          <h3 className="font-bold text-base text-neutral-900 tracking-tight">{title}</h3>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {children}
      </div>
    </section>
  );
}

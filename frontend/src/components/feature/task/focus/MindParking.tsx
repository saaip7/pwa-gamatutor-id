"use client";

import React from "react";
import { StickyNote } from "lucide-react";

export function MindParking() {
  return (
    <section className="space-y-4 pb-10">
      <h3 className="text-[11px] font-black text-neutral-400 tracking-widest uppercase px-1 flex items-center gap-2">
        <StickyNote className="w-3.5 h-3.5" /> Parkir Pikiran (Quick Notes)
      </h3>
      <textarea 
        className="w-full h-32 p-5 bg-neutral-50 border border-neutral-200 rounded-[24px] text-base text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none shadow-inner leading-relaxed font-medium"
        placeholder="Ada distraksi? Tulis di sini agar otakmu tetap tenang dan fokus..."
      ></textarea>
    </section>
  );
}

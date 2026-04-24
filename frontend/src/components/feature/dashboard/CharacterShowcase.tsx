"use client";

import React from "react";
import { Flame, Timer, CheckCircle2, ShieldCheck, Palette } from "lucide-react";
import { CharacterComposer } from "@/components/feature/character/CharacterComposer";
import type { SlotLevel } from "@/components/feature/character/item-registry";
import { usePreferencesStore } from "@/stores/preferences";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import styles from "./CharacterShowcase.module.css";

interface UserStats {
  streak: number;
  focusHours: number;
  tasksCompleted: number;
  badgesUnlocked: number;
  totalBadges: number;
}

interface CharacterShowcaseProps {
  stats: UserStats;
  onStreakTap?: () => void;
  className?: string;
}

export function CharacterShowcase({ stats, onStreakTap, className }: CharacterShowcaseProps) {
  const character = usePreferencesStore((s) => s.preferences?.character);
  const router = useRouter();

  return (
    <div className={cn("anim-fade-in-up lg:h-full", className)} style={{ animationDelay: "0.2s" }}>
      <div className="bg-white rounded-[24px] border border-neutral-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] p-5 flex flex-col relative overflow-hidden lg:h-full">

        <div className="flex justify-between items-center w-full px-5 pb-5 mb-6 border-b border-neutral-100/80">
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => router.push("/account/streak")}
              className="flex items-center gap-1 mb-1 group cursor-pointer bg-transparent border-none p-0"
            >
              <Flame className="text-error w-[18px] h-[18px] group-active:scale-110 transition-transform" />
              <span className="text-sm font-bold text-neutral-900">{stats.streak}</span>
            </button>
            <span className="text-xs font-medium text-neutral-500">Streak</span>
          </div>

          <div className="w-px h-8 bg-neutral-200/80"></div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 mb-1">
              <Timer className="text-primary w-[18px] h-[18px]" />
              <span className="text-sm font-bold text-neutral-900">{stats.focusHours}j</span>
            </div>
            <span className="text-xs font-medium text-neutral-500">Fokus</span>
          </div>

          <div className="w-px h-8 bg-neutral-200/80"></div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 mb-1">
              <CheckCircle2 className="text-success w-[18px] h-[18px]" />
              <span className="text-sm font-bold text-neutral-900">{stats.tasksCompleted}</span>
            </div>
            <span className="text-xs font-medium text-neutral-500">Tugas</span>
          </div>
        </div>

        <div className="relative flex flex-col items-center w-full lg:flex-1">

          <div className="relative w-full h-[280px] lg:h-full rounded-[24px] border-2 border-blue-200/40 bg-gradient-to-b from-blue-50/60 via-purple-50/40 to-white flex justify-center items-end shadow-sm overflow-hidden">

            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm border border-blue-100 pl-2.5 pr-3.5 py-1.5 rounded-full z-20 flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-[15px] h-[15px] text-blue-600" />
              <span className="text-xs font-bold text-blue-700 tracking-tight">
                {stats.badgesUnlocked > 0 ? `${stats.badgesUnlocked} Pencapaian` : "Mulai Belajar"}
              </span>
            </div>

            <Link
              href="/account/wardrobe"
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:shadow-sm hover:border-neutral-300 transition-all z-20 active:scale-95 cursor-pointer"
            >
              <Palette className="w-5 h-5" />
            </Link>

            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/80 rounded-full blur-3xl z-0 pointer-events-none"></div>
            <div className="absolute bottom-4 w-48 h-8 bg-slate-900/10 rounded-[100%] blur-[6px] z-0"></div>
            <div className="absolute bottom-5 w-28 h-4 bg-slate-900/20 rounded-[100%] blur-[3px] z-0"></div>

            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-blue-300/60 rounded-bl-sm z-10 pointer-events-none"></div>
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-blue-300/60 rounded-br-sm z-10 pointer-events-none"></div>

            <div className="relative z-10 h-[250px] drop-shadow-[0_16px_24px_rgba(0,0,0,0.15)] flex items-end justify-center mb-4">
              <CharacterComposer
                gender={character?.gender ?? "male"}
                head={(character?.equipped?.head as SlotLevel) ?? "base"}
                top={(character?.equipped?.top as SlotLevel) ?? "base"}
                bottom={(character?.equipped?.bottom as SlotLevel) ?? "base"}
                className="h-full w-auto"
                slotClassNames={{
                  top: styles.torso,
                  head: styles.head,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

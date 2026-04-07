"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { CharacterComposer } from "@/components/feature/character/CharacterComposer";
import type { SlotLevel } from "@/components/feature/character/item-registry";
import { usePreferencesStore } from "@/stores/preferences";

interface ProfileCardProps {
  name: string;
  title: string;
}

export function ProfileCard({ name, title }: ProfileCardProps) {
  const character = usePreferencesStore((s) => s.preferences?.character);

  return (
    <motion.div
      className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-5 flex flex-row items-center gap-5 relative overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Left Column: Character Bust (head + shoulders) */}
      <div className="w-[96px] h-[96px] shrink-0 rounded-[24px] bg-blue-50 border border-blue-100 flex items-end justify-center overflow-hidden relative shadow-[inset_0_2px_8px_rgba(59,130,246,0.05)]">
        <CharacterComposer
          gender={character?.gender ?? "male"}
          head={(character?.equipped?.head as SlotLevel) ?? "base"}
          top={(character?.equipped?.top as SlotLevel) ?? "base"}
          bottom={(character?.equipped?.bottom as SlotLevel) ?? "base"}
          viewBox="0 25 120 150"
          className="w-full h-full drop-shadow-sm"
        />
      </div>

      {/* Right Column: User Details */}
      <div className="flex-1 flex flex-col justify-center relative z-10">
        <h2 className="text-lg font-bold text-neutral-900 tracking-tight leading-tight">{name}</h2>
        <p className="text-sm font-medium text-primary mt-0.5 mb-3">{title}</p>

        {/* CTA Button */}
        <Link
          href="/account/wardrobe"
          className="inline-flex w-fit px-4 py-2.5 rounded-lg border border-neutral-200 bg-white text-neutral-700 text-xs font-semibold items-center justify-center hover:bg-neutral-50 active:bg-neutral-100 transition-all shadow-sm"
        >
          Sesuaikan Karakter
        </Link>
      </div>
    </motion.div>
  );
}

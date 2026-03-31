"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Shirt, Footprints, Sparkles, Check, Lock } from "lucide-react";
import { Gender } from "@/components/feature/character/types";
import { SettingsHeader } from "@/components/feature/settings/SettingsHeader";
import { CharacterComposer } from "@/components/feature/character/CharacterComposer";

import { cn } from "@/lib/utils";
import {
  type SlotLevel,
  type ItemDef,
  getItemsBySlot,
  getHeadComponent,
  getTopComponent,
  getBottomComponent,
} from "@/components/feature/character/item-registry";

const SLOT_COMPONENT_FN = {
  head: getHeadComponent,
  top: getTopComponent,
  bottom: getBottomComponent,
} as const;

// --- Equipped state ---
interface Equipped {
  head: SlotLevel;
  top: SlotLevel;
  bottom: SlotLevel;
}

// --- Sub-components ---

function CharacterStage({ equipped, gender, onGenderChange }: { equipped: Equipped; gender: Gender; onGenderChange: (g: Gender) => void }) {
  return (
    <section className="relative w-full h-[320px] flex flex-col items-center justify-start pt-4 overflow-hidden bg-[radial-gradient(circle_at_50%_100%,#f3f4f6_0%,#ffffff_50%)]">
      {/* Gender Switcher */}
      <div className="absolute top-3 left-4 z-20">
        <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full p-[3px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
          {(["male", "female"] as const).map((g) => {
            const isActive = gender === g;
            return (
              <button
                key={g}
                onClick={() => onGenderChange(g)}
                className={cn(
                  "relative w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-extrabold leading-none transition-all duration-200",
                  isActive && g === "male" && "text-primary",
                  isActive && g === "female" && "text-pink-500",
                  !isActive && "text-neutral-300 hover:text-neutral-400"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="genderDot"
                    className={cn(
                      "absolute inset-0 rounded-full",
                      g === "male" ? "bg-primary/8 border border-primary/20" : "bg-pink-500/8 border border-pink-500/20"
                    )}
                    transition={{ type: "spring", stiffness: 550, damping: 35 }}
                  />
                )}
                <span className="relative z-10">
                  {g === "male" ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="10.5" cy="13.5" r="5.5" />
                      <line x1="22" y1="2" x2="15.5" y2="8.5" />
                      <polyline points="16 2 22 2 22 8" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="15" r="5.5" />
                      <line x1="12" y1="9.5" x2="12" y2="2" />
                      <line x1="9" y1="5" x2="15" y2="5" />
                    </svg>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <CharacterComposer
          gender={gender}
          head={equipped.head}
          top={equipped.top}
          bottom={equipped.bottom}
          className="w-[140px] h-[240px] drop-shadow-xl"
        />
      </div>
    </section>
  );
}

const CATEGORIES = [
  { id: "head" as const, label: "Kepala", icon: User },
  { id: "top" as const, label: "Baju", icon: Shirt },
  { id: "bottom" as const, label: "Kaki", icon: Footprints },
  { id: "special" as const, label: "Spesial", icon: Sparkles },
];

export default function WardrobePage() {
  const [activeTab, setActiveTab] = useState<"head" | "top" | "bottom" | "special">("head");
  const [gender, setGender] = useState<Gender>("male");
  const [equipped, setEquipped] = useState<Equipped>({
    head: "base",
    top: "base",
    bottom: "base",
  });

  const items = getItemsBySlot(activeTab);

  const handleSave = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log("Saving character appearance...", equipped);
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col mx-auto overflow-hidden relative max-w-md">
      <SettingsHeader title="Sesuaikan Karakter" onSave={handleSave} />

      <main className="flex-1 overflow-y-auto no-scrollbar relative bg-white">
        <CharacterStage equipped={equipped} gender={gender} onGenderChange={setGender} />

        {/* Category Tabs */}
        <div className="sticky top-0 z-40 bg-white border-b border-neutral-100 flex">
          {CATEGORIES.map((cat) => {
            const isActive = activeTab === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className="flex-1 flex flex-col items-center justify-center gap-1 py-3 relative transition-colors"
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-neutral-400")} />
                <span className={cn("text-[10px] font-bold uppercase tracking-wide", isActive ? "text-primary" : "text-neutral-400")}>
                  {cat.label}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full" 
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Item Grid */}
        <div className="px-5 py-6 bg-neutral-50 min-h-full pb-32">
          <div className="grid grid-cols-3 gap-4">
            {items.map((item) => {
              const isEquipped = equipped[activeTab as keyof Equipped] === item.id;
              const isUnlocked = true; // TODO: use real unlock logic based on streak
              const slotKey = activeTab as "head" | "top" | "bottom";
              const ItemPreview = SLOT_COMPONENT_FN[slotKey](item.id);
              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => isUnlocked && setEquipped((prev) => ({ ...prev, [activeTab]: item.id }))}
                  className="flex flex-col items-center gap-2 group outline-none"
                >
                  <div className={cn(
                    "w-full aspect-square rounded-2xl bg-white border-2 transition-all relative flex items-center justify-center overflow-hidden",
                    isEquipped ? "border-primary shadow-md" : "border-neutral-100 hover:border-neutral-200 shadow-sm",
                    !isUnlocked && "bg-neutral-100/50"
                  )}>
                    {/* Real Item Preview */}
                    <div className={cn("w-16 h-16 flex items-center justify-center", !isUnlocked && "grayscale opacity-40")}>
                      <ItemPreview gender={gender} />
                    </div>

                    {/* Badge */}
                    <div className={cn(
                      "absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center border",
                      isEquipped ? "bg-primary text-white border-primary" :
                      !isUnlocked ? "bg-white text-neutral-400 border-neutral-200" : "hidden"
                    )}>
                      {isEquipped ? <Check className="w-3 h-3 stroke-[4]" /> : <Lock className="w-2.5 h-2.5" />}
                    </div>
                  </div>
                  <span className={cn(
                    "text-[11px] font-bold text-center leading-tight line-clamp-1 w-full",
                    isEquipped ? "text-primary" : isUnlocked ? "text-neutral-700" : "text-neutral-400"
                  )}>
                    {item.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

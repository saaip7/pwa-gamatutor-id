"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Shirt, Footprints, Sparkles, Check, Lock } from "lucide-react";
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

function CharacterStage({ equipped }: { equipped: Equipped }) {
  return (
    <section className="relative w-full h-[320px] flex flex-col items-center justify-start pt-4 overflow-hidden bg-[radial-gradient(circle_at_50%_100%,#f3f4f6_0%,#ffffff_50%)]">
      <div className="relative z-10 flex flex-col items-center">
        <CharacterComposer
          gender="male"
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
        <CharacterStage equipped={equipped} />

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
                      <ItemPreview gender="male" />
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

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Shirt, Footprints, Sparkles, Check, Lock } from "lucide-react";
import { SettingsHeader } from "@/components/feature/settings/SettingsHeader";
import { CharacterAvatar } from "@/components/feature/wardrobe/CharacterAvatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

// --- Sub-components ---

function CharacterStage({ hoodieColor }: { hoodieColor: string }) {
  return (
    <section className="relative w-full h-[320px] flex flex-col items-center justify-start pt-8 overflow-hidden bg-[radial-gradient(circle_at_50%_100%,#f3f4f6_0%,#ffffff_50%)]">
      <div className="relative z-10 flex flex-col items-center">
        <CharacterAvatar 
          hoodieColor={hoodieColor} 
          className="w-[160px] h-[220px] drop-shadow-xl" 
        />
        <div className="w-[150px] h-[14px] bg-gradient-to-b from-white to-neutral-200 border border-neutral-200 rounded-lg shadow-md mt-1 relative">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white rounded-t-lg"></div>
        </div>
      </div>

      <div className="absolute bottom-6 flex flex-col items-center z-20">
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Alex</h2>
        <Badge variant="blue" className="mt-1.5 bg-white shadow-sm normal-case">
          The Strategist
        </Badge>
      </div>
    </section>
  );
}

const CATEGORIES = [
  { id: "head", label: "Kepala", icon: User },
  { id: "shirt", label: "Baju", icon: Shirt },
  { id: "feet", label: "Kaki", icon: Footprints },
  { id: "special", label: "Spesial", icon: Sparkles },
];

export default function WardrobePage() {
  const [activeTab, setActiveTab] = useState("shirt");
  const [selectedHoodie, setSelectedHoodie] = useState("#3b82f6");

  const items = [
    { id: "blue", name: "Classic Blue", color: "#3b82f6", unlocked: true },
    { id: "emerald", name: "Nature Green", color: "#10b981", unlocked: true },
    { id: "amber", name: "Sunset Gold", color: "#f59e0b", unlocked: true },
    { id: "crimson", name: "Crimson Red", color: "#ef4444", unlocked: false },
    { id: "indigo", name: "Deep Indigo", color: "#4f46e5", unlocked: false },
    { id: "slate", name: "Urban Slate", color: "#475569", unlocked: false },
  ];

  const handleSave = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log("Saving character appearance...");
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col mx-auto overflow-hidden relative max-w-md">
      <SettingsHeader title="Sesuaikan Karakter" onSave={handleSave} />

      <main className="flex-1 overflow-y-auto no-scrollbar relative bg-white">
        <CharacterStage hoodieColor={selectedHoodie} />

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
              const isEquipped = selectedHoodie === item.color;
              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => item.unlocked && setSelectedHoodie(item.color)}
                  className="flex flex-col items-center gap-2 group outline-none"
                >
                  <div className={cn(
                    "w-full aspect-square rounded-2xl bg-white border-2 transition-all relative flex items-center justify-center overflow-hidden",
                    isEquipped ? "border-primary shadow-md" : "border-neutral-100 hover:border-neutral-200 shadow-sm",
                    !item.unlocked && "bg-neutral-100/50"
                  )}>
                    {/* Item Preview SVG */}
                    <div className={cn("w-14 h-14 translate-y-2", !item.unlocked && "grayscale opacity-40")}>
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <rect x="15" y="20" width="70" height="65" rx="24" fill={item.color} />
                        <path d="M25 50 q 25 10 50 0" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.3" />
                      </svg>
                    </div>

                    {/* Badge */}
                    <div className={cn(
                      "absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center border",
                      isEquipped ? "bg-primary text-white border-primary" : 
                      !item.unlocked ? "bg-white text-neutral-400 border-neutral-200" : "hidden"
                    )}>
                      {isEquipped ? <Check className="w-3 h-3 stroke-[4]" /> : <Lock className="w-2.5 h-2.5" />}
                    </div>
                  </div>
                  <span className={cn(
                    "text-[11px] font-bold text-center leading-tight line-clamp-1 w-full",
                    isEquipped ? "text-primary" : item.unlocked ? "text-neutral-700" : "text-neutral-400"
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

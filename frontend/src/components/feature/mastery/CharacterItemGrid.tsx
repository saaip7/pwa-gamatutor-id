"use client";

import React from "react";
import { Shield, Crown, Footprints, Shirt, Wand2, Gem } from "lucide-react";

const CHARACTER_ITEMS = [
  { icon: Shield, label: "Shield" },
  { icon: Crown, label: "Crown" },
  { icon: Footprints, label: "Boots" },
  { icon: Shirt, label: "Cloak" },
  { icon: Wand2, label: "Staff" },
  { icon: Gem, label: "Amulet" },
];

interface CharacterItemGridProps {
  unlocked?: boolean;
}

export function CharacterItemGrid({ unlocked = true }: CharacterItemGridProps) {
  return (
    <div className="w-full flex flex-col items-center">
      <p className="text-[11px] font-bold text-amber-500 uppercase tracking-widest mb-4">Item Unlocked</p>
      <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
        {CHARACTER_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`aspect-square rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-black/20 ${
                unlocked
                  ? "bg-white border border-gray-200 hover:scale-105 hover:bg-gray-50"
                  : "bg-white/50 border border-gray-200/50 opacity-40"
              }`}
            >
              <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
                <Icon className="text-xl text-gray-800 drop-shadow-sm" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

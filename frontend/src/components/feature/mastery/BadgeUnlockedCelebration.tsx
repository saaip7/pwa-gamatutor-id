"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, ArrowRight, UserRound, Shirt, Footprints } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { SnowfallParticles } from "@/components/shared/SnowfallParticles";
import { MasteryBadgeIcon, type BadgeShape } from "./MasteryBadgeIcon";
import { ITEMS } from "@/components/feature/character/item-registry";

interface BadgeCelebrationData {
  name: string;
  subtitle: string;
  icon: LucideIcon;
  shape: BadgeShape;
  badgeType?: string;
}

interface BadgeUnlockedCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  data: BadgeCelebrationData | null;
}

export type { BadgeCelebrationData };

const SLOT_ICONS: Record<string, LucideIcon> = {
  head: UserRound,
  top: Shirt,
  bottom: Footprints,
};

interface UnlockedItem {
  name: string;
  slot: string;
}

function getUnlockedItems(badgeType: string): UnlockedItem[] {
  const items: UnlockedItem[] = [];
  for (const item of ITEMS) {
    if (item.slot === "special") continue;
    if (item.badgeId.male === badgeType || item.badgeId.female === badgeType) {
      const maleUnlocked = item.badgeId.male === badgeType;
      const femaleUnlocked = item.badgeId.female === badgeType;
      if (maleUnlocked && femaleUnlocked) {
        items.push({ name: `${item.names.male} / ${item.names.female}`, slot: item.slot });
      } else if (maleUnlocked) {
        items.push({ name: item.names.male, slot: item.slot });
      } else if (femaleUnlocked) {
        items.push({ name: item.names.female, slot: item.slot });
      }
    }
  }
  return items;
}

export function BadgeUnlockedCelebration({ isOpen, onClose, data }: BadgeUnlockedCelebrationProps) {
  const router = useRouter();

  if (!data) return null;

  const unlockedItems = data.badgeType
    ? getUnlockedItems(data.badgeType)
    : [];

  const handleGoToWardrobe = () => {
    onClose();
    router.push("/account/wardrobe");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center"
        >
          <div className="absolute inset-0 bg-[#0A0D14]" />
          <SnowfallParticles colorTheme="amber" />

          <div className="relative z-10 flex flex-col items-center px-8 text-center max-w-sm w-full">

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl font-bold text-white tracking-tight mb-2"
            >
              {data.name}
              <span className="text-amber-400 ml-1.5">Terbuka!</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="text-sm text-gray-400 leading-relaxed mb-8"
            >
              {data.subtitle}
            </motion.p>

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1], type: "spring", stiffness: 120 }}
              className="relative mb-8"
            >
              <div className="absolute inset-0 bg-amber-500 rounded-full blur-[80px] opacity-30 animate-pulse" />
              <div className="relative w-[160px] h-[160px] rounded-full bg-white/5 border border-amber-400/30 flex items-center justify-center animate-float drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                <MasteryBadgeIcon
                  shape={data.shape}
                  icon={data.icon}
                  iconClassName="[&>svg]:w-[52px] [&>svg]:h-[52px]"
                />
              </div>

              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-5 h-5 text-amber-300 animate-ping" style={{ animationDuration: "2s" }} />
              </div>
              <div className="absolute -bottom-1 -left-3">
                <Sparkles className="w-4 h-4 text-amber-200 animate-ping" style={{ animationDelay: "0.7s", animationDuration: "2.5s" }} />
              </div>
              <div className="absolute -top-1 -left-4">
                <Star className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
              </div>
              <div className="absolute top-1/2 -right-5 -translate-y-1/2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
              </div>
              <div className="absolute -bottom-3 right-4">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-bounce" style={{ animationDelay: "0.5s" }} />
              </div>
            </motion.div>

            {data.badgeType && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="w-full mb-8"
              >
                <p className="text-[11px] font-bold text-amber-500 uppercase tracking-widest mb-3">
                  Item Terbuka
                </p>
                {unlockedItems.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {unlockedItems.map((item) => {
                      const SlotIcon = SLOT_ICONS[item.slot];
                      return (
                        <div
                          key={`${item.slot}-${item.name}`}
                          className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                        >
                          {SlotIcon && <SlotIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                          <span className="text-sm font-medium text-amber-100">{item.name}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center px-4 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <span className="text-sm font-medium text-amber-100/70 italic">Karakter dasar terbuka!</span>
                  </div>
                )}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 w-full max-w-xs"
            >
              <button
                onClick={handleGoToWardrobe}
                className="flex-1 py-4 rounded-xl font-bold text-white bg-gray-900/80 border border-gray-600 backdrop-blur-sm transition-all active:scale-[0.98]"
              >
                Pasang ke Karakter
              </button>
              <button
                onClick={onClose}
                className="w-[60px] shrink-0 rounded-xl bg-blue-600 flex items-center justify-center text-white transition-all active:scale-[0.98] self-stretch"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

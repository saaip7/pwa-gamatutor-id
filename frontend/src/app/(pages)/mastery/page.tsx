"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Layers,
  Zap,
  Brain,
  Crown,
  Sprout,
  Square,
  Target,
  Timer,
  Flame,
  BookOpen,
  Compass,
  Mountain,
  TrendingUp,
  Award,
  LucideIcon,
} from "lucide-react";
import { motion, Variants } from "framer-motion";
import { MasterySVGDefs } from "@/components/feature/mastery/MasterySVGDefs";
import { MasterySection } from "@/components/feature/mastery/MasterySection";
import { MasteryBadgeCard } from "@/components/feature/mastery/MasteryBadgeCard";
import { BadgeUnlockedCelebration } from "@/components/feature/mastery/BadgeUnlockedCelebration";
import type { BadgeCelebrationData } from "@/components/feature/mastery/BadgeUnlockedCelebration";
import { useBadgesStore } from "@/stores/badges";
import type { Badge } from "@/types";
import type { BadgeShape } from "@/components/feature/mastery/MasteryBadgeIcon";

// Map badge type → icon
const BADGE_ICON_MAP: Record<string, LucideIcon> = {
  initiator: Sprout,
  architect: Square,
  deep_diver: Target,
  marathoner: Timer,
  ritualist: Flame,
  reflector: BookOpen,
  strategist: Compass,
  explorer: Mountain,
  improver: TrendingUp,
  zenith: Award,
};

// Map category → section config
const CATEGORY_CONFIG: Record<string, { title: string; icon: LucideIcon; iconColor: string }> = {
  foundation: { title: "Foundation", icon: Layers, iconColor: "text-emerald-500" },
  performance: { title: "Performance", icon: Zap, iconColor: "text-amber-500" },
  mindset: { title: "Mindset", icon: Brain, iconColor: "text-indigo-500" },
  mastery: { title: "Mastery", icon: Crown, iconColor: "text-blue-500" },
};

const CATEGORY_ORDER = ["foundation", "performance", "mindset", "mastery"];

export default function MasteryPage() {
  const router = useRouter();
  const { badges, fetchBadges } = useBadgesStore();
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [celebrationData, setCelebrationData] = useState<BadgeCelebrationData | null>(null);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  // Group badges by category in defined order
  const grouped = CATEGORY_ORDER.map((cat) => ({
    ...CATEGORY_CONFIG[cat],
    badges: badges.filter((b) => b.category === cat),
  })).filter((g) => g.badges.length > 0);

  const handleBadgeClick = (badge: Badge) => {
    if (!badge.unlocked) return;
    const icon = BADGE_ICON_MAP[badge.type] || Award;
    setCelebrationData({
      name: badge.name,
      subtitle: badge.description,
      icon,
      shape: (badge.shape as BadgeShape) || "circle",
      badgeType: badge.type,
    });
    setCelebrationOpen(true);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col mx-auto overflow-hidden relative max-w-md">
      <MasterySVGDefs />

      {/* Header */}
      <header className="shrink-0 pt-14 pb-4 px-5 flex items-center justify-between bg-white z-50 sticky top-0 border-b border-neutral-100">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 -ml-2 flex items-center justify-center text-neutral-500 hover:text-neutral-900 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg md:text-xl font-bold text-neutral-900 tracking-tight">Mastery Gallery</h1>
        <div className="w-10 h-10" />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar bg-neutral-50/30">
        <motion.div
          className="px-5 py-6 flex flex-col gap-10 pb-32"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {grouped.map((group) => (
            <motion.div key={group.title} variants={itemVariants}>
              <MasterySection title={group.title} icon={group.icon} iconColor={group.iconColor}>
                {group.badges.map((badge) => (
                  <MasteryBadgeCard
                    key={badge.type}
                    title={badge.name}
                    description={badge.description}
                    shape={(badge.shape as BadgeShape) || "circle"}
                    icon={BADGE_ICON_MAP[badge.type] || Award}
                    isUnlocked={badge.unlocked}
                    onClick={() => handleBadgeClick(badge)}
                  />
                ))}
              </MasterySection>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Badge Unlocked Celebration Overlay */}
      {celebrationData && (
        <BadgeUnlockedCelebration
          isOpen={celebrationOpen}
          onClose={() => setCelebrationOpen(false)}
          data={celebrationData}
        />
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { Award } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Sprout, Square, Target, Timer, Flame, BookOpen,
  Compass, Mountain, TrendingUp,
} from "lucide-react";
import { BadgeUnlockedCelebration } from "@/components/feature/mastery/BadgeUnlockedCelebration";
import { MasterySVGDefs } from "@/components/feature/mastery/MasterySVGDefs";
import type { BadgeCelebrationData } from "@/components/feature/mastery/BadgeUnlockedCelebration";
import type { BadgeShape } from "@/components/feature/mastery/MasteryBadgeIcon";
import { useBadgesStore } from "@/stores/badges";
import type { Badge } from "@/types";

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

function badgeToCelebrationData(badge: Badge): BadgeCelebrationData {
  return {
    name: badge.name,
    subtitle: badge.celebration_message || badge.description,
    icon: BADGE_ICON_MAP[badge.type] || Award,
    shape: (badge.shape as BadgeShape) || "circle",
    badgeType: badge.type,
  };
}

export function BadgeCelebrationManager() {
  const badges = useBadgesStore((s) => s.badges);
  const markDisplayed = useBadgesStore((s) => s.markDisplayed);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const undisplayed = badges.filter((b) => b.unlocked && !b.displayed);

  // When new undisplayed badges appear, start showing
  useEffect(() => {
    if (undisplayed.length > 0 && !open) {
      setCurrentIndex(0);
      setOpen(true);
    }
  }, [undisplayed.length]);

  const currentBadge = undisplayed[currentIndex];

  const handleClose = async () => {
    if (!currentBadge) return;

    // Mark as displayed in BE
    await markDisplayed(currentBadge.type);

    // Check if there's a next badge to show
    const nextIndex = currentIndex + 1;
    if (nextIndex < undisplayed.length) {
      // Brief close, then reopen for next badge
      setOpen(false);
      setTimeout(() => {
        setCurrentIndex(nextIndex);
        setOpen(true);
      }, 400);
    } else {
      setOpen(false);
    }
  };

  if (!currentBadge) return null;

  return (
    <>
      <MasterySVGDefs />
      <BadgeUnlockedCelebration
        isOpen={open}
        onClose={handleClose}
        data={badgeToCelebrationData(currentBadge)}
      />
    </>
  );
}

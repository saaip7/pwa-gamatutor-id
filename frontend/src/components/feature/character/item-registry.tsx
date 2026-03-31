"use client";

import React from "react";
import { Gender } from "./types";

// Item components
import { HeadBase } from "./items/head/head-base";
import { HeadLv1 } from "./items/head/head-lv1";
import { HeadLv2 } from "./items/head/head-lv2";
import { HeadLv3 } from "./items/head/head-lv3";
import { HeadLv4 } from "./items/head/head-lv4";
import { TopBase } from "./items/top/top-base";
import { TopLv1 } from "./items/top/top-lv1";
import { TopLv2 } from "./items/top/top-lv2";
import { TopLv3 } from "./items/top/top-lv3";
import { TopLv4 } from "./items/top/top-lv4";
import { TopLv5 } from "./items/top/top-lv5";
import { BottomBase } from "./items/bottom/bottom-base";
import { BottomLv1 } from "./items/bottom/bottom-lv1";
import { BottomLv2 } from "./items/bottom/bottom-lv2";
import { BottomLv3 } from "./items/bottom/bottom-lv3";
import { BottomLv4 } from "./items/bottom/bottom-lv4";
import { BottomLv5 } from "./items/bottom/bottom-lv5";

export type SlotLevel = "base" | "lv1" | "lv2" | "lv3" | "lv4" | "lv5";

export interface ItemDef {
  id: SlotLevel;
  name: string;
  slot: "head" | "top" | "bottom" | "special";
  level: number;
  unlockStreak: number;
}

export const ITEMS: ItemDef[] = [
  // Head
  { id: "base", slot: "head", name: "Default", level: 0, unlockStreak: 0 },
  { id: "lv1", slot: "head", name: "Spiky", level: 1, unlockStreak: 3 },
  { id: "lv2", slot: "head", name: "Wavy", level: 2, unlockStreak: 7 },
  { id: "lv3", slot: "head", name: "Braids", level: 3, unlockStreak: 14 },
  { id: "lv4", slot: "head", name: "Slicked", level: 4, unlockStreak: 21 },
  // Top
  { id: "base", slot: "top", name: "Tee", level: 0, unlockStreak: 0 },
  { id: "lv1", slot: "top", name: "Hoodie", level: 1, unlockStreak: 3 },
  { id: "lv2", slot: "top", name: "Blazer", level: 2, unlockStreak: 7 },
  { id: "lv3", slot: "top", name: "Military", level: 3, unlockStreak: 14 },
  { id: "lv4", slot: "top", name: "Royal", level: 4, unlockStreak: 21 },
  { id: "lv5", slot: "top", name: "Emperor", level: 5, unlockStreak: 30 },
  // Bottom
  { id: "base", slot: "bottom", name: "Default", level: 0, unlockStreak: 0 },
  { id: "lv1", slot: "bottom", name: "Jeans", level: 1, unlockStreak: 3 },
  { id: "lv2", slot: "bottom", name: "Cargo", level: 2, unlockStreak: 7 },
  { id: "lv3", slot: "bottom", name: "Chinos", level: 3, unlockStreak: 14 },
  { id: "lv4", slot: "bottom", name: "Tactical", level: 4, unlockStreak: 21 },
  { id: "lv5", slot: "bottom", name: "Royal", level: 5, unlockStreak: 30 },
];

export function getItemsBySlot(slot: ItemDef["slot"]) {
  return ITEMS.filter((item) => item.slot === slot);
}

// Component mapping
const HEAD_MAP: Record<SlotLevel, React.FC<{ gender: Gender }>> = {
  base: HeadBase,
  lv1: HeadLv1,
  lv2: HeadLv2,
  lv3: HeadLv3,
  lv4: HeadLv4,
  lv5: HeadBase, // no lv5 head, fallback
};

const TOP_MAP: Record<SlotLevel, React.FC<{ gender: Gender }>> = {
  base: TopBase,
  lv1: TopLv1,
  lv2: TopLv2,
  lv3: TopLv3,
  lv4: TopLv4,
  lv5: TopLv5,
};

const BOTTOM_MAP: Record<SlotLevel, React.FC<{ gender: Gender }>> = {
  base: BottomBase,
  lv1: BottomLv1,
  lv2: BottomLv2,
  lv3: BottomLv3,
  lv4: BottomLv4,
  lv5: BottomLv5,
};

export function getHeadComponent(level: SlotLevel) {
  return HEAD_MAP[level];
}

export function getTopComponent(level: SlotLevel) {
  return TOP_MAP[level];
}

export function getBottomComponent(level: SlotLevel) {
  return BOTTOM_MAP[level];
}
